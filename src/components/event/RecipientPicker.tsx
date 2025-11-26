import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Building2, User, X, ChevronDown, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Organization {
  id: string;
  name: string;
  memberCount: number;
}

interface Individual {
  id: string;
  name: string;
  email: string;
}

interface Recipient {
  type: 'organization' | 'individual';
  id: string;
  name: string;
  email?: string;
  memberCount?: number;
}

interface RecipientPickerProps {
  selectedRecipients: Recipient[];
  onChange: (recipients: Recipient[]) => void;
}

export const RecipientPicker = ({ selectedRecipients, onChange }: RecipientPickerProps) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());
  const [orgMembers, setOrgMembers] = useState<Record<string, Individual[]>>({});

  useEffect(() => {
    fetchOrganizations();
    fetchIndividuals();
  }, []);

  const fetchOrganizations = async () => {
    const { data: orgsData, error: orgsError } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("is_active", true);

    if (orgsError) {
      console.error("Error fetching organizations:", orgsError);
      return;
    }

    const orgsWithCounts = await Promise.all(
      (orgsData || []).map(async (org) => {
        const { count } = await supabase
          .from("organization_members")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", org.id);

        return {
          id: org.id,
          name: org.name,
          memberCount: count || 0,
        };
      })
    );

    setOrganizations(orgsWithCounts);
  };

  const fetchIndividuals = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching individuals:", error);
      return;
    }

    setIndividuals(
      (data || []).map((profile) => ({
        id: profile.id,
        name: profile.full_name || "Unknown",
        email: profile.email || "",
      }))
    );
  };

  const fetchOrgMembers = async (orgId: string) => {
    if (orgMembers[orgId]) return;

    const { data, error } = await supabase
      .from("organization_members")
      .select(`
        user_id,
        profiles!inner(id, full_name, email)
      `)
      .eq("organization_id", orgId);

    if (error) {
      console.error("Error fetching org members:", error);
      return;
    }

    const members = (data || []).map((member: any) => ({
      id: member.profiles.id,
      name: member.profiles.full_name || "Unknown",
      email: member.profiles.email || "",
    }));

    setOrgMembers((prev) => ({ ...prev, [orgId]: members }));
  };

  const toggleOrgExpansion = (orgId: string) => {
    const newExpanded = new Set(expandedOrgs);
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId);
    } else {
      newExpanded.add(orgId);
      fetchOrgMembers(orgId);
    }
    setExpandedOrgs(newExpanded);
  };

  const addRecipient = (recipient: Recipient) => {
    if (!selectedRecipients.find((r) => r.id === recipient.id && r.type === recipient.type)) {
      onChange([...selectedRecipients, recipient]);
    }
  };

  const removeRecipient = (recipient: Recipient) => {
    onChange(selectedRecipients.filter((r) => !(r.id === recipient.id && r.type === recipient.type)));
  };

  const filteredOrgs = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIndividuals = individuals.filter(
    (ind) =>
      ind.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ind.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Selected Recipients */}
      {selectedRecipients.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-md">
          {selectedRecipients.map((recipient) => (
            <Badge
              key={`${recipient.type}-${recipient.id}`}
              variant="secondary"
              className="flex items-center gap-2 pl-2 pr-1 py-1"
            >
              {recipient.type === 'organization' ? (
                <Building2 className="h-3 w-3" />
              ) : (
                <User className="h-3 w-3" />
              )}
              <span className="text-sm">
                {recipient.name}
                {recipient.type === 'organization' && recipient.memberCount && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({recipient.memberCount} members)
                  </span>
                )}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeRecipient(recipient)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search and Select */}
      <Tabs defaultValue="organizations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="organizations">
            <Building2 className="h-4 w-4 mr-2" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="individuals">
            <User className="h-4 w-4 mr-2" />
            Individuals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-2">
          <Input
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2"
          />
          <ScrollArea className="h-[300px] border border-border rounded-md p-2">
            {filteredOrgs.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                No organizations found
              </div>
            ) : (
              <div className="space-y-1">
                {filteredOrgs.map((org) => (
                  <div key={org.id} className="space-y-1">
                    <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent flex-1 justify-start"
                        onClick={() => toggleOrgExpansion(org.id)}
                      >
                        {expandedOrgs.has(org.id) ? (
                          <ChevronDown className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2" />
                        )}
                        <Building2 className="h-4 w-4 mr-2" />
                        <span className="text-sm">{org.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({org.memberCount} members)
                        </span>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          addRecipient({
                            type: 'organization',
                            id: org.id,
                            name: org.name,
                            memberCount: org.memberCount,
                          })
                        }
                      >
                        Add
                      </Button>
                    </div>
                    {expandedOrgs.has(org.id) && orgMembers[org.id] && (
                      <div className="ml-8 space-y-1">
                        {orgMembers[org.id].map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-2 text-sm text-muted-foreground"
                          >
                            <span>
                              {member.name} ({member.email})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="individuals" className="space-y-2">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2"
          />
          <ScrollArea className="h-[300px] border border-border rounded-md p-2">
            {filteredIndividuals.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                No individuals found
              </div>
            ) : (
              <div className="space-y-1">
                {filteredIndividuals.map((individual) => (
                  <div
                    key={individual.id}
                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <div className="text-sm font-medium">{individual.name}</div>
                        <div className="text-xs text-muted-foreground">{individual.email}</div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        addRecipient({
                          type: 'individual',
                          id: individual.id,
                          name: individual.name,
                          email: individual.email,
                        })
                      }
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

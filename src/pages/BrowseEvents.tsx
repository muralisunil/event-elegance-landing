import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BrowseEvents = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Events" },
    { id: "music", name: "Music & Concerts" },
    { id: "sports", name: "Sports" },
    { id: "theater", name: "Theater & Arts" },
    { id: "conference", name: "Conferences" },
    { id: "workshops", name: "Workshops" },
  ];

  const events = [
    {
      id: 1,
      title: "Summer Music Festival 2025",
      category: "music",
      date: "July 15, 2025",
      location: "Central Park, NY",
      price: "$45",
      image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80",
    },
    {
      id: 2,
      title: "Tech Innovation Summit",
      category: "conference",
      date: "Aug 22, 2025",
      location: "Convention Center, SF",
      price: "$299",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    },
    {
      id: 3,
      title: "Broadway Musical Night",
      category: "theater",
      date: "Sep 10, 2025",
      location: "Broadway Theater, NY",
      price: "$85",
      image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80",
    },
    {
      id: 4,
      title: "Champions League Final",
      category: "sports",
      date: "May 28, 2025",
      location: "Wembley Stadium, London",
      price: "$350",
      image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80",
    },
    {
      id: 5,
      title: "Jazz Evening Under Stars",
      category: "music",
      date: "June 5, 2025",
      location: "Rooftop Venue, LA",
      price: "$55",
      image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80",
    },
    {
      id: 6,
      title: "Digital Marketing Workshop",
      category: "workshops",
      date: "Oct 12, 2025",
      location: "Online",
      price: "$149",
      image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80",
    },
  ];

  const filteredEvents = selectedCategory === "all" 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">
              Book My Event
            </h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-primary-foreground hover:text-primary-foreground/80">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Filter Section */}
      <section className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for events, artists, venues..."
                className="pl-12 h-14 text-lg bg-background border-none"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "secondary" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id ? "" : "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">
          {selectedCategory === "all" ? "Popular Events" : categories.find(c => c.id === selectedCategory)?.name}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="group cursor-pointer rounded-lg overflow-hidden bg-card hover:scale-105 transition-transform duration-300"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-5 space-y-3">
                <h3 className="font-bold text-lg line-clamp-2 group-hover:text-secondary transition-colors">
                  {event.title}
                </h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{event.date}</p>
                  <p>{event.location}</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xl font-bold text-secondary">{event.price}</span>
                  <Button size="sm" variant="secondary">
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BrowseEvents;

import { useColorTheme } from '@/hooks/useColorTheme';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ColorThemeSelector() {
  const { colorTheme, setColorTheme, availableThemes } = useColorTheme();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {availableThemes.map((theme) => (
        <Card
          key={theme.id}
          className={cn(
            'cursor-pointer transition-all hover:border-primary',
            colorTheme === theme.id && 'border-primary ring-2 ring-primary'
          )}
          onClick={() => setColorTheme(theme.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: `hsl(${theme.colors.light.secondary})` }}
              />
              {colorTheme === theme.id && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </div>
            <h3 className="font-semibold text-sm mb-1">{theme.name}</h3>
            <p className="text-xs text-muted-foreground">{theme.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

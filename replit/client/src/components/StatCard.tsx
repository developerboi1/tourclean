import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  bgColor 
}: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </p>
            {subtitle && (
              <p className={`text-sm mt-1 ${subtitle.startsWith('+') ? 'text-green-600' : subtitle.startsWith('-') ? 'text-red-600' : 'text-muted-foreground'}`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
            <Icon className={`${color} w-6 h-6`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  MapPin,
  Clock,
  DollarSign,
  Trash2,
  ExternalLink,
  Play,
  Headphones,
  Newspaper
} from 'lucide-react';

interface ItemRendererProps {
  item: any;
  onRemove: (item: any) => void;
}

export function JobItemRenderer({ item, onRemove }: ItemRendererProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-0 shadow-xl bg-card/80 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <ImageWithFallback
              src={item.logo}
              alt={item.company}
              className="w-12 h-12 rounded-lg object-cover ring-2 ring-border"
            />
            <div>
              <h3 className="text-lg text-foreground mb-1">{item.title}</h3>
              <p className="text-muted-foreground mb-2">{item.company}</p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {item.location}
                </span>
                <span className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {item.salary}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <Badge className="bg-success/10 text-success hover:bg-success/10 mb-2">
              {item.match}% match
            </Badge>
            <p className="text-sm text-muted-foreground">Saved {item.savedDate}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline">Job</Badge>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => onRemove(item)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button size="sm">
              Apply Now
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PodcastItemRenderer({ item, onRemove }: ItemRendererProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-0 shadow-xl bg-card/80 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <ImageWithFallback
            src={item.thumbnail}
            alt={item.title}
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg text-foreground mb-1">{item.title}</h3>
            <p className="text-muted-foreground mb-2">{item.show}</p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {item.duration}
              </span>
              <span>Saved {item.savedDate}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Headphones className="w-3 h-3 mr-1" />
                Podcast
              </Badge>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onRemove(item)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Listen
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ArticleItemRenderer({ item, onRemove }: ItemRendererProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-0 shadow-xl bg-card/80 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <ImageWithFallback
            src={item.thumbnail}
            alt={item.title}
            className="w-24 h-16 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg text-foreground mb-1">{item.title}</h3>
            <p className="text-muted-foreground mb-2">{item.source}</p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {item.readTime}
              </span>
              <span>Saved {item.savedDate}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20">
                <Newspaper className="w-3 h-3 mr-1" />
                Article
              </Badge>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onRemove(item)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button size="sm">
                  Read More
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResourceItemRenderer({ item, onRemove }: ItemRendererProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-0 shadow-xl bg-card/80 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <ImageWithFallback
            src={item.thumbnail}
            alt={item.title}
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg text-foreground mb-1">{item.title}</h3>
            <p className="text-muted-foreground mb-2">{item.provider}</p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {item.duration}
              </span>
              <span className="text-success">{item.price}</span>
              <span>Saved {item.savedDate}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                Course
              </Badge>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onRemove(item)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Start Learning
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
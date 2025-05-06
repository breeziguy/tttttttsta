import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Video, AlertCircle, Loader2, ChevronRight, X, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

interface Resource {
  id: string;
  title: string;
  description: string;
  content_type: 'video' | 'document' | 'article';
  video_url?: string;
  thumbnail_url?: string;
  category: string;
  tags: string[];
  duration_minutes?: number;
  published: boolean;
  view_count: number;
}

const RESOURCE_CATEGORIES = {
  training: 'Training',
  guidelines: 'Best Practices',
  legal: 'Legal Documents',
  faq: 'FAQs',
  support: 'Support',
  updates: 'Updates',
  vetting: 'Vetting Guidelines'
};

interface ResourceDetailsModalProps {
  resource: Resource;
  onClose: () => void;
}

function ResourceDetailsModal({ resource, onClose }: ResourceDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">{resource.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {resource.content_type === 'video' && resource.video_url ? (
            <div className="aspect-video mb-6">
              <iframe
                src={resource.video_url.replace('vimeo.com', 'player.vimeo.com/video')}
                className="w-full h-full rounded-lg"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>
          ) : resource.thumbnail_url ? (
            <img
              src={resource.thumbnail_url}
              alt={resource.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          ) : null}

          <div className="space-y-4">
            <p className="text-gray-600">{resource.description}</p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {resource.duration_minutes && (
                <div className="flex items-center">
                  <Video className="w-4 h-4 mr-1" />
                  {resource.duration_minutes} minutes
                </div>
              )}
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                {resource.content_type}
              </div>
            </div>

            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('resources')
        .select('*')
        .eq('published', true as any)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setResources(data as any || []);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchResources}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const groupedResources = resources.reduce((acc, resource) => {
    const category = resource.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  return (
    <div className="space-y-6 py-4 px-6 bg-green-50 rounded-lg min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
      </div>

      {loading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="text-gray-600">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchResources}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedResources).map(([category, categoryResources]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 pb-2 border-b border-gray-200">
                {RESOURCE_CATEGORIES[category as keyof typeof RESOURCE_CATEGORIES] || category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoryResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="bg-white rounded-lg shadow overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md transform hover:-translate-y-1"
                    onClick={() => setSelectedResource(resource)}
                  >
                    <div className="aspect-video relative">
                      {resource.thumbnail_url ? (
                        <img
                          src={resource.thumbnail_url}
                          alt={resource.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          {resource.content_type === 'video' ? (
                            <Video className="w-12 h-12 text-gray-400" />
                          ) : (
                            <BookOpen className="w-12 h-12 text-gray-400" />
                          )}
                        </div>
                      )}
                      {resource.duration_minutes && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                          {resource.duration_minutes} min
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{resource.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{resource.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="text-xs px-2 py-1 bg-primary bg-opacity-10 text-primary rounded-full">
                          {resource.content_type}
                        </div>
                        <div className="text-primary">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedResource && (
        <ResourceDetailsModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Eye, Calendar, Clock } from 'lucide-react';
import { Journey } from '../types/journey';

interface HomePageProps {
  onEditJourney: (journey: Journey) => void;
  onPreviewJourney: (journey: Journey) => void;
  onCreateJourney: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onEditJourney, onPreviewJourney, onCreateJourney }) => {
  const [journeys, setJourneys] = useState<Journey[]>([]);

  useEffect(() => {
    const savedJourneys = JSON.parse(localStorage.getItem('journeys') || '[]');
    setJourneys(savedJourneys);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Journey Graph Builder</h1>
          <p className="text-gray-600">Create and manage your journey flows with visual graph builder</p>
        </div>

        <div className="mb-6">
          <button
            onClick={onCreateJourney}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus size={20} />
            Add Journey
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journeys.map((journey) => (
            <div key={journey.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{journey.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{journey.description}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  journey.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {journey.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(journey.createdAt).toLocaleDateString()}

                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(journey.updatedAt).toLocaleDateString()}

                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Nodes:</span>
                  <span className="ml-2 font-medium">{journey.nodes.length}</span>
                </div>
                <div>
                  <span className="text-gray-500">Functions:</span>
                  <span className="ml-2 font-medium">{journey.functions.length}</span>
                </div>
                <div>
                  <span className="text-gray-500">Edges:</span>
                  <span className="ml-2 font-medium">{journey.edges.length}</span>
                </div>
                <div>
                  <span className="text-gray-500">Properties:</span>
                  <span className="ml-2 font-medium">{journey.properties.length}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEditJourney(journey)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => onPreviewJourney(journey)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>

        {journeys.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No journeys yet</h3>
            <p className="text-gray-600 mb-4">Create your first journey to get started</p>
            <button
              onClick={onCreateJourney}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Journey
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
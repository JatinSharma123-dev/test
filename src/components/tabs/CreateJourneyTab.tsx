import React, { useState, useEffect } from 'react';
import { useJourney } from '../../context/JourneyContext';
import axios from '../../lib/axios';

const CreateJourneyTab: React.FC = () => {
  const { journey, updateJourney } = useJourney();
  const [name, setName] = useState(journey.name);
  const [description, setDescription] = useState(journey.description);

  useEffect(() => {
    setName(journey.name);
    setDescription(journey.description);
  }, [journey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateJourney({ name, description });


    //api call
    


    
    // // Create start and end nodes if they don't exist
    // const hasStartNode = journey.nodes.some(node => node.type === 'start');
    // const hasEndNode = journey.nodes.some(node => node.type === 'end');
    
    // if (!hasStartNode) {
    //   addNode({
    //     name: 'Start',
    //     type: 'start',
    //     description: 'Starting point of the journey',
    //     properties: [],
    //     x: 100,
    //     y: 100
    //   });
    // }
    
    // if (!hasEndNode) {
    //   addNode({
    //     name: 'End',
    //     type: 'end',
    //     description: 'End point of the journey',
    //     properties: [],
    //     x: 500,
    //     y: 100
    //   });
    // }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Create Journey</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Journey Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter journey name"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Describe your journey..."
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Journey
        </button>
      </form>

      {journey.name && (
        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <p className="text-green-800 font-medium">Journey Created Successfully!</p>
        </div>
      )}
    </div>
  );
};

export default CreateJourneyTab;
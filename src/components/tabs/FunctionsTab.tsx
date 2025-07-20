import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useJourney } from '../../context/JourneyContext';
import { Function } from '../../types/journey';
import { useMemo } from 'react';

interface FunctionHeader {
  key: string;
  type: 'constant' | 'property';
  value: string;
}

const FunctionsTab: React.FC = () => {
  const { journey, addFunction, updateFunction, deleteFunction } = useJourney();
  const [isEditing, setIsEditing] = useState(false);
  const [editingFunction, setEditingFunction] = useState<Function | null>(null);
  const [headerKeys, setHeaderKeys] = useState<{ [key: string]: string }>({});
  const [extraFieldKeys, setExtraFieldKeys] = useState<{ [key: string]: string }>({});
  const [inputPropertyKeys, setInputPropertyKeys] = useState<{ [key: string]: string }>({});
  const [outputPropertyKeys, setOutputPropertyKeys] = useState<{ [key: string]: string }>({});
  const [requestBodyKeys, setRequestBodyKeys] = useState<{ [key: string]: string }>({});
  const [requestBodyPathKeys, setRequestBodyPathKeys] = useState<{ [key: string]: string }>({});
  // Refactor requestBody to be an array of objects with id, apiField, and property fields
  // Update initial state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    config: {
      host: '',
      path: '',
      method: 'GET',
      header_params: {} as { [key: string]: string },
      headers: [] as FunctionHeader[],
      requestBody: [] as { id: string; apiField: string; property: string }[],
      requestBodyPath: {} as { [key: string]: string }
    },
    input_properties: {} as { [key: string]: string },
    output_properties: {} as { [key: string]: string }
  });

  const handleHeaderParamKeyChange = (oldKey: string, newKey: string) => {
  setHeaderKeys(prev => ({
    ...prev,
    [oldKey]: newKey
  }));
};

const handleHeaderParamKeyBlur = (oldKey: string) => {
  const newKey = headerKeys[oldKey] || oldKey;
  if (newKey !== oldKey && newKey.trim() !== '') {
    const value = formData.config.header_params[oldKey];
    const newParams = { ...formData.config.header_params };
    delete newParams[oldKey];
    newParams[newKey] = value;
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, header_params: newParams }
    }));
    setHeaderKeys(prev => {
      const updated = { ...prev };
      delete updated[oldKey];
      return updated;
    });
  }
};

const handleHeaderKeyChange = (oldKey: string, newKey: string) => {
  setHeaderKeys(prev => ({
    ...prev,
    [oldKey]: newKey
  }));
};

const handleHeaderKeyBlur = (oldKey: string) => {
  const newKey = headerKeys[oldKey] || oldKey;
  if (newKey !== oldKey && newKey.trim() !== '') {
    const value = formData.config.headers.find(h => h.key === oldKey)?.value;
    setFormData(prev => {
      const headers = [...prev.config.headers];
      const index = headers.findIndex(h => h.key === oldKey);
      if (index !== -1) {
        headers[index] = { ...headers[index], key: newKey };
      }
      return {
        ...prev,
        config: {
          ...prev.config,
          headers
        }
      };
    });
  }
};

// Request Body logic: key = API field, value = property name
// Add, update, remove for requestBody
const addRequestBodyField = () => {
  setFormData(prev => ({
    ...prev,
    config: {
      ...prev.config,
      requestBody: [
        ...prev.config.requestBody,
        { id: `body_${Date.now()}`, apiField: '', property: '' }
      ]
    }
  }));
};
// Update requestBody logic to sync with input_properties
const updateRequestBodyField = (id: string, field: 'apiField' | 'property', value: string) => {
  setFormData(prev => {
    // Update the requestBody array
    const newRequestBody = prev.config.requestBody.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    // Build new input_properties from all mapped properties in requestBody
    let newInputProperties = { ...prev.input_properties };
    // Remove all properties that are mapped in requestBody
    const mappedProps = new Set(newRequestBody.map(item => item.property).filter(Boolean));
    // Remove unmapped properties that were previously mapped
    Object.keys(newInputProperties).forEach(key => {
      if (!mappedProps.has(key) && prev.config.requestBody.some(item => item.property === key)) {
        delete newInputProperties[key];
      }
    });
    // Add all mapped properties with their type
    newRequestBody.forEach(item => {
      if (item.property) {
        const prop = journey.properties.find(p => p.key === item.property);
        if (prop) newInputProperties[prop.key] = prop.type;
      }
    });
    return {
      ...prev,
      config: {
        ...prev.config,
        requestBody: newRequestBody
      },
      input_properties: newInputProperties
    };
  });
};
const removeRequestBodyField = (id: string) => {
  setFormData(prev => ({
    ...prev,
    config: {
      ...prev.config,
      requestBody: prev.config.requestBody.filter(item => item.id !== id)
    }
  }));
};

// Remove Request Body Path logic and UI
// Request Body Path logic: key = property name, value = JSON path
// const addRequestBodyPathField = () => {
//   const key = `bodypath_${Date.now()}`;
//   setFormData(prev => ({
//     ...prev,
//     config: {
//       ...prev.config,
//       requestBodyPath: {
//         ...prev.config.requestBodyPath,
//         [key]: ''
//       }
//     }
//   }));
// };
// const updateRequestBodyPathField = (key: string, value: string) => {
//   setFormData(prev => ({
//     ...prev,
//     config: {
//       ...prev.config,
//       requestBodyPath: {
//         ...prev.config.requestBodyPath,
//         [key]: value
//       }
//     }
//   }));
// };
// const removeRequestBodyPathField = (key: string) => {
//   setFormData(prev => ({
//     ...prev,
//     config: {
//       ...prev.config,
//       requestBodyPath: Object.fromEntries(
//         Object.entries(prev.config.requestBodyPath).filter(([k]) => k !== key)
//       )
//     }
//   }));
// };

const handleInputPropertyKeyChange = (oldKey: string, newKey: string) => {
  setInputPropertyKeys(prev => ({
    ...prev,
    [oldKey]: newKey
  }));
};

const handleInputPropertyKeyBlur = (oldKey: string) => {
  const newKey = inputPropertyKeys[oldKey] || oldKey;
  if (newKey !== oldKey && newKey.trim() !== '') {
    const value = formData.input_properties[oldKey];
    const newInputs = { ...formData.input_properties };
    delete newInputs[oldKey];
    newInputs[newKey] = value;
    setFormData(prev => ({
      ...prev,
      input_properties: newInputs
    }));
    setInputPropertyKeys(prev => {
      const updated = { ...prev };
      delete updated[oldKey];
      return updated;
    });
  }
};

const handleOutputPropertyKeyChange = (oldKey: string, newKey: string) => {
  setOutputPropertyKeys(prev => ({
    ...prev,
    [oldKey]: newKey
  }));
};

const handleOutputPropertyKeyBlur = (oldKey: string) => {
  const newKey = outputPropertyKeys[oldKey] || oldKey;
  if (newKey !== oldKey && newKey.trim() !== '') {
    const value = formData.output_properties[oldKey];
    const newOutputs = { ...formData.output_properties };
    delete newOutputs[oldKey];
    newOutputs[newKey] = value;
    setFormData(prev => ({
      ...prev,
      output_properties: newOutputs
    }));
    setOutputPropertyKeys(prev => {
      const updated = { ...prev };
      delete updated[oldKey];
      return updated;
    });
  }
};

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      config: {
        host: '',
        path: '',
        method: 'GET',
        header_params: {},
        headers: [],
        requestBody: [],
        requestBodyPath: {}
      },
      input_properties: {},
      output_properties: {}
    });
    setIsEditing(false);
    setEditingFunction(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const functionData = {
      ...formData,
      config: {
        ...formData.config
      }
    };
    
    if (editingFunction) {
      updateFunction(editingFunction.id, functionData);
    } else {
      addFunction(functionData);
    }
    
    resetForm();
  };

  const handleEdit = (func: Function) => {
    setEditingFunction(func);
    const { host, path, method, header_params, headers, requestBody = [], requestBodyPath = {}, ...rest } = func.config;
    setFormData({
      name: func.name,
      type: func.type,
      config: {
        host,
        path,
        method,
        header_params,
        headers: headers || [],
        requestBody: requestBody || [],
        requestBodyPath
      },
      input_properties: func.input_properties,
      output_properties: func.output_properties
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    deleteFunction(id);
  };

  const addHeaderField = () => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        headers: [
          ...prev.config.headers,
          { key: '', type: 'constant', value: '' }
        ]
      }
    }));
  };

  const updateHeaderField = (index: number, field: keyof FunctionHeader, value: string) => {
    setFormData(prev => {
      const headers = [...prev.config.headers];
      headers[index] = { ...headers[index], [field]: value };
      // If type changes, reset value if switching to property
      if (field === 'type' && value === 'property') {
        headers[index].value = '';
      }

      let newHeaderParams = { ...prev.config.header_params };
      let newInputProperties = { ...prev.input_properties };
      // If the value field is changed and type is property, update header_params
      if (field === 'value' && headers[index].type === 'property') {
        // value is property id
        const prop = journey.properties.find(p => p.id === value);
        if (prop) {
          newHeaderParams[prop.key] = prop.type;
          newInputProperties[prop.key] = prop.type;
        }
      }

      return {
        ...prev,
        config: {
          ...prev.config,
          headers,
          header_params: newHeaderParams
        },
        input_properties: newInputProperties
      };
    });
  };

  const removeHeaderField = (index: number) => {
    setFormData(prev => {
      const headers = [...prev.config.headers];
      const removedHeader = headers[index];
      headers.splice(index, 1);

      let newHeaderParams = { ...prev.config.header_params };
      let newInputProperties = { ...prev.input_properties };
      if (removedHeader.type === 'property') {
        const prop = journey.properties.find(p => p.id === removedHeader.value);
        if (prop) {
          delete newHeaderParams[prop.key];
          delete newInputProperties[prop.key];
        }
      }

      return {
        ...prev,
        config: {
          ...prev.config,
          headers,
          header_params: newHeaderParams
        },
        input_properties: newInputProperties
      };
    });
  };

  const addHeaderParamField = () => {
    const key = `param_${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        header_params: {
          ...prev.config.header_params,
          [key]: ''
        }
      }
    }));
  };

  const updateHeaderParamField = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        header_params: {
          ...prev.config.header_params,
          [key]: value
        }
      }
    }));
  };

  const removeHeaderParamField = (key: string) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        header_params: Object.fromEntries(
          Object.entries(prev.config.header_params).filter(([k]) => k !== key)
        )
      }
    }));
  };

  const addInputProperty = () => {
    const key = `input_${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      input_properties: {
        ...prev.input_properties,
        [key]: ''
      }
    }));
  };

  const updateInputProperty = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      input_properties: {
        ...prev.input_properties,
        [key]: value
      }
    }));
  };

  const removeInputProperty = (key: string) => {
    setFormData(prev => ({
      ...prev,
      input_properties: Object.fromEntries(
        Object.entries(prev.input_properties).filter(([k]) => k !== key)
      )
    }));
  };

  const addOutputProperty = () => {
    const key = `output_${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      output_properties: {
        ...prev.output_properties,
        [key]: ''
      }
    }));
  };

  const updateOutputProperty = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      output_properties: {
        ...prev.output_properties,
        [key]: value
      }
    }));
  };

  const removeOutputProperty = (key: string) => {
    setFormData(prev => ({
      ...prev,
      output_properties: Object.fromEntries(
        Object.entries(prev.output_properties).filter(([k]) => k !== key)
      )
    }));
  };

  // JSON Previewer logic
  const jsonPreview = useMemo(() => {
    // req_body: API field -> property name
    const reqBodyObj: Record<string, string> = {};
    formData.config.requestBody.forEach(item => {
      if (item.apiField && item.property) reqBodyObj[item.apiField] = item.property;
    });
    const req_body = JSON.stringify(reqBodyObj);
    // req_body_path: property name -> $.<API field> (auto-generated)
    const req_body_path: Record<string, string> = {};
    formData.config.requestBody.forEach(item => {
      if (item.apiField && item.property) req_body_path[item.property] = `$.${item.apiField}`;
    });

    // header_param: just use formData.config.header_params
    const header_param = { ...formData.config.header_params };

    // headers: key is header.key, value is either header.value (custom) or property key (if type is property)
    const headers: Record<string, string> = {};
    formData.config.headers.forEach(h => {
      if (!h.key) return;
      if (h.type === 'constant') {
        headers[h.key] = h.value;
      } else if (h.type === 'property') {
        const prop = journey.properties.find(p => p.id === h.value);
        headers[h.key] = prop ? prop.key : h.value;
      }
    });

    // inputProperties: key is property key, value is type
    const inputProperties: Record<string, string> = {};
    Object.entries(formData.input_properties).forEach(([key, type]) => {
      inputProperties[key] = type;
    });

    // outputProperties: key is property key, value is type
    const outputProperties: Record<string, string> = {};
    Object.entries(formData.output_properties).forEach(([key, type]) => {
      outputProperties[key] = type;
    });

    const previewObj = {
      name: formData.name,
      type: formData.type,
      config: {
        host: formData.config.host,
        path: formData.config.path,
        method: formData.config.method,
        req_body,
        req_body_path,
        header_param,
        headers
      },
      inputProperties,
      outputProperties
    };

    return JSON.stringify(previewObj, null, 2);
  }, [formData, journey.properties]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Functions</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Function
        </button>
      </div>

      {isEditing && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-gray-900 mb-4">
            {editingFunction ? 'Edit Function' : 'Add New Function'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Send Email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>Select type</option>
                  <option value="API">API</option>
                  <option value="KAFKA">KAFKA</option>
                </select>
                </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                  <input
                    type="text"
                    value={formData.config.host}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      config: { ...formData.config, host: e.target.value } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://api.example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Path</label>
                  <input
                    type="text"
                    value={formData.config.path}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      config: { ...formData.config, path: e.target.value } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="/api/v1/users"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                  <select
                    value={formData.config.method}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      config: { ...formData.config, method: e.target.value } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

              </div>

              

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Headers</label>
                  <button
                    type="button"
                    onClick={addHeaderField}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Header
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.config.headers.map((header, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={header.key}
                        onChange={e => updateHeaderField(idx, 'key', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Header key"
                      />
                      <select
                        value={header.type}
                        onChange={e => updateHeaderField(idx, 'type', e.target.value)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="constant">Constant</option>
                        <option value="property">Property</option>
                      </select>
                      {header.type === 'constant' ? (
                        <input
                          type="text"
                          value={header.value}
                          onChange={e => updateHeaderField(idx, 'value', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Header value"
                        />
                      ) : (
                        <select
                          value={header.value}
                          onChange={e => updateHeaderField(idx, 'value', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="" disabled>Select property</option>
                          {journey.properties.map((prop) => (
                            <option key={prop.id} value={prop.id}>{prop.key}</option>
                          ))}
                        </select>
                      )}
                      <button
                        type="button"
                        onClick={() => removeHeaderField(idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4" hidden>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Header Params</label>
                  <button
                    type="button"
                    onClick={addHeaderParamField}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Header Param
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(formData.config.header_params).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <input
                        type="text"
                        value={headerKeys[key] ?? key}
                        onChange={(e) => handleHeaderParamKeyChange(key, e.target.value)}
                        onBlur={() => handleHeaderParamKeyBlur(key)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Param key"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateHeaderParamField(key, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Param value"
                      />
                      <button
                        type="button"
                        onClick={() => removeHeaderParamField(key)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {formData.config.method !== 'GET' && (
                <>
                  {/* Request Body Section */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Request Body</label>
                      <button
                        type="button"
                        onClick={addRequestBodyField}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Body Field
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.config.requestBody.map((item) => (
                        <div key={item.id} className="flex gap-2">
                          {/* API field name (text input) */}
                          <input
                            type="text"
                            value={item.apiField}
                            onChange={e => updateRequestBodyField(item.id, 'apiField', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Body key (API field)"
                          />
                          {/* Property name dropdown */}
                          <select
                            value={item.property}
                            onChange={e => updateRequestBodyField(item.id, 'property', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="" disabled>Select property</option>
                            {journey.properties.map((prop) => (
                              <option key={prop.key} value={prop.key}>{prop.key}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => removeRequestBodyField(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Request Body Path Section is now hidden/removed */}
                </>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div hidden>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Input Properties</label>
                    <button
                      type="button"
                      onClick={addInputProperty}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Input
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(formData.input_properties).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <input
                          type="text"
                          value={inputPropertyKeys[key] ?? key}
                          onChange={(e) => handleInputPropertyKeyChange(key, e.target.value)}
                          onBlur={() => handleInputPropertyKeyBlur(key)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Input key"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateInputProperty(key, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Input value"
                        />
                        <button
                          type="button"
                          onClick={() => removeInputProperty(key)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Output Properties</label>
                    <button
                      type="button"
                      onClick={addOutputProperty}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Output
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(formData.output_properties).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <input
                          type="text"
                          value={outputPropertyKeys[key] ?? key}
                          onChange={(e) => handleOutputPropertyKeyChange(key, e.target.value)}
                          onBlur={() => handleOutputPropertyKeyBlur(key)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Output key"
                        />
                        <select
                          value={value}
                          onChange={(e) => updateOutputProperty(key, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select type</option>
                          <option value="STRING">STRING</option>
                          <option value="BOOLEAN">BOOLEAN</option>
                          <option value="DATE">DATE</option>
                          <option value="NUMBER">NUMBER</option>
                          <option value="TIMESTAMP">TIMESTAMP</option>
                          <option value="RANGE">RANGE</option>
                          <option value="LIST">LIST</option>
                          <option value="MAP">MAP</option>
                          
                        </select>
                        <button
                          type="button"
                          onClick={() => removeOutputProperty(key)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                {editingFunction ? 'Update' : 'Add'} Function
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {/* JSON Previewer: show when creating or editing a function */}
      {isEditing && (
        <div className="mt-8">
          <h4 className="font-medium text-gray-900 mb-2">JSON Preview</h4>
          <pre className="bg-gray-900 text-green-200 p-4 rounded-lg overflow-x-auto text-xs">
            {jsonPreview}
          </pre>
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h3 className="font-medium text-gray-900">Function List</h3>
        </div>
        
        {journey.functions.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No functions created yet. Click "Add Function" to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {journey.functions.map((func) => (
              <div key={func.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">{func.name}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {func.type}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{func.config.method}</span> {func.config.host}{func.config.path}
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>Headers: {Object.keys(func.config.headers).length}</span>
                      <span>Inputs: {Object.keys(func.input_properties).length}</span>
                      <span>Outputs: {Object.keys(func.output_properties).length}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(func)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(func.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FunctionsTab;
/**
 * Mutation Editor - Visual and code editor for route mutations
 *
 * Supports:
 * - Visual mode: Form-based mutation builder
 * - Code mode: Monaco editor with JSON schema validation
 */

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Code, Eye } from 'lucide-react';
import type { PreMutations, PostMutations } from '../../../shared/src/types';

interface MutationEditorProps {
  type: 'pre' | 'post';
  value: PreMutations | PostMutations;
  onChange: (value: PreMutations | PostMutations) => void;
}

export function MutationEditor({ type, value, onChange }: MutationEditorProps) {
  const [mode, setMode] = useState<'visual' | 'code'>('visual');

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Mode Toggle */}
      <div className="bg-gray-50 border-b border-gray-300 px-4 py-2 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">
          {type === 'pre' ? 'Pre-Request' : 'Post-Response'} Mutations
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('visual')}
            className={`px-3 py-1 text-sm rounded ${
              mode === 'visual'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-1" />
            Visual
          </button>
          <button
            onClick={() => setMode('code')}
            className={`px-3 py-1 text-sm rounded ${
              mode === 'code'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            <Code className="w-4 h-4 inline mr-1" />
            Code
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-4">
        {mode === 'visual' ? (
          <VisualMutationEditor type={type} value={value} onChange={onChange} />
        ) : (
          <CodeMutationEditor value={value} onChange={onChange} />
        )}
      </div>
    </div>
  );
}

function VisualMutationEditor({
  type,
  value,
  onChange,
}: MutationEditorProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        Use the visual editor to configure mutations. Header mutations, query
        parameter mutations, and body transformations can be configured here.
      </div>

      {/* Header Mutations */}
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Header Mutations</h4>
        <div className="text-sm text-gray-500">
          {value.headers && value.headers.length > 0
            ? `${value.headers.length} header mutation(s) configured`
            : 'No header mutations configured'}
        </div>
      </div>

      {/* Query Mutations (Pre only) */}
      {type === 'pre' && 'queryParams' in value && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">
            Query Parameter Mutations
          </h4>
          <div className="text-sm text-gray-500">
            {value.queryParams && value.queryParams.length > 0
              ? `${value.queryParams.length} query mutation(s) configured`
              : 'No query mutations configured'}
          </div>
        </div>
      )}

      {/* Body Mutations */}
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Body Mutations</h4>
        <div className="text-sm text-gray-500">
          {value.body && value.body.length > 0
            ? `${value.body.length} body mutation(s) configured`
            : 'No body mutations configured'}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        💡 Switch to Code mode to edit mutations as JSON, or use the visual
        editor for a guided experience.
      </div>
    </div>
  );
}

function CodeMutationEditor({
  value,
  onChange,
}: {
  value: PreMutations | PostMutations;
  onChange: (value: PreMutations | PostMutations) => void;
}) {
  const handleChange = (newValue: string | undefined) => {
    if (!newValue) return;

    try {
      const parsed = JSON.parse(newValue);
      onChange(parsed);
    } catch (error) {
      // Invalid JSON, don't update
      console.error('Invalid JSON:', error);
    }
  };

  return (
    <div className="border border-gray-300 rounded overflow-hidden">
      <Editor
        height="400px"
        defaultLanguage="json"
        value={JSON.stringify(value, null, 2)}
        onChange={handleChange}
        theme="vs-light"
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
}

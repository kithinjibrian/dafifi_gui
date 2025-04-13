import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@/components/ui/resizable";
import React, { useRef } from "react";

export interface PanelProps {
    id: string | number;
    minSize?: number;
    maxSize?: number;
    content?: (panelRef: React.RefObject<any>) => React.ReactNode;
    defaultSize?: number;
    collapsible?: boolean;
    collapsedSize?: number;
    children?: PanelProps[];
    direction?: 'horizontal' | 'vertical';
}

interface RenderPanelsProps {
    panels: PanelProps[];
    direction?: 'horizontal' | 'vertical';
}

export const RenderPanels: React.FC<RenderPanelsProps> = ({ panels, direction = 'horizontal' }) => {
    return (
        <ResizablePanelGroup direction={direction}>
            {panels.map(({ id, content, children, direction: childDirection, ...props }, index) => {
                const panelRef = useRef<any>(null);

                return (
                    <React.Fragment key={id}>
                        {children ? (
                            <ResizablePanel
                                {...props}
                                ref={props.collapsible ? panelRef : undefined}
                            >
                                <RenderPanels panels={children} direction={childDirection || 'horizontal'} />
                            </ResizablePanel>
                        ) : (
                            <ResizablePanel
                                {...props}
                                ref={props.collapsible ? panelRef : undefined}
                                className="h-[93vh]"
                            >
                                {content && content(panelRef)}
                            </ResizablePanel>
                        )}

                        {/* Only add handle between panels, not after the last one */}
                        {index < panels.length - 1 && (
                            <ResizableHandle className="hover:bg-sky-500" withHandle />
                        )}
                    </React.Fragment>
                );
            })}
        </ResizablePanelGroup>
    );
};


/**
 import React, { useRef, createContext, useContext, useState, useEffect } from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';

// Create a context to manage panel references and states
interface PanelContextType {
  registerPanel: (id: string | number, ref: any) => void;
  getPanelRef: (id: string | number) => any;
  collapsePanel: (id: string | number) => void;
  expandPanel: (id: string | number) => void;
  togglePanel: (id: string | number) => void;
  isCollapsed: (id: string | number) => boolean;
}

const PanelContext = createContext<PanelContextType | null>(null);

// Hook to use the panel context
const usePanelControl = () => {
  const context = useContext(PanelContext);
  if (!context) {
    throw new Error('usePanelControl must be used within a PanelProvider');
  }
  return context;
};

export interface PanelProps {
  id: string | number;
  minSize?: number;
  maxSize?: number;
  content?: (control: PanelContextType) => React.ReactNode;
  defaultSize?: number;
  collapsible?: boolean;
  collapsedSize?: number;
  children?: PanelProps[];
  direction?: 'horizontal' | 'vertical';
}

interface RenderPanelsProps {
  panels: PanelProps[];
  direction?: 'horizontal' | 'vertical';
}

export const PanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Store refs to all panels
  const panelRefs = useRef<Record<string | number, any>>({});
  // Store collapse states
  const [collapsedStates, setCollapsedStates] = useState<Record<string | number, boolean>>({});

  // Register a panel ref
  const registerPanel = (id: string | number, ref: any) => {
    panelRefs.current[id] = ref;
  };

  // Get a panel ref by id
  const getPanelRef = (id: string | number) => {
    return panelRefs.current[id];
  };

  // Collapse a panel by id
  const collapsePanel = (id: string | number) => {
    const panel = panelRefs.current[id];
    if (panel && !collapsedStates[id]) {
      panel.collapse();
      setCollapsedStates(prev => ({ ...prev, [id]: true }));
    }
  };

  // Expand a panel by id
  const expandPanel = (id: string | number) => {
    const panel = panelRefs.current[id];
    if (panel && collapsedStates[id]) {
      panel.expand();
      setCollapsedStates(prev => ({ ...prev, [id]: false }));
    }
  };

  // Toggle a panel by id
  const togglePanel = (id: string | number) => {
    const panel = panelRefs.current[id];
    if (panel) {
      if (collapsedStates[id]) {
        panel.expand();
        setCollapsedStates(prev => ({ ...prev, [id]: false }));
      } else {
        panel.collapse();
        setCollapsedStates(prev => ({ ...prev, [id]: true }));
      }
    }
  };

  // Check if a panel is collapsed
  const isCollapsed = (id: string | number) => {
    return !!collapsedStates[id];
  };

  // Create context value
  const contextValue = {
    registerPanel,
    getPanelRef,
    collapsePanel,
    expandPanel,
    togglePanel,
    isCollapsed
  };

  return (
    <PanelContext.Provider value={contextValue}>
      {children}
    </PanelContext.Provider>
  );
};

export const RenderPanels: React.FC<RenderPanelsProps> = ({ panels, direction = 'horizontal' }) => {
  const panelControl = usePanelControl();

  return (
    <ResizablePanelGroup direction={direction} className="min-h-full">
      {panels.map(({ id, content, children, direction: childDirection, ...props }, index) => (
        <React.Fragment key={id}>
          {children ? (
            // Panel with nested children
            <ResizablePanel 
              {...props}
              ref={props.collapsible ? (ref) => {
                if (ref) panelControl.registerPanel(id, ref);
              } : undefined}
              onCollapse={() => {
                // This handles manual dragging/collapsing
                if (!panelControl.isCollapsed(id)) {
                  panelControl.collapsePanel(id);
                }
              }}
              onExpand={() => {
                // This handles manual dragging/expanding
                if (panelControl.isCollapsed(id)) {
                  panelControl.expandPanel(id);
                }
              }}
            >
              <div className="h-full">
                <RenderPanels panels={children} direction={childDirection || 'horizontal'} />
              </div>
            </ResizablePanel>
          ) : (
            // Leaf panel with content
            <ResizablePanel
              {...props}
              ref={props.collapsible ? (ref) => {
                if (ref) panelControl.registerPanel(id, ref);
              } : undefined}
              onCollapse={() => {
                if (!panelControl.isCollapsed(id)) {
                  panelControl.collapsePanel(id);
                }
              }}
              onExpand={() => {
                if (panelControl.isCollapsed(id)) {
                  panelControl.expandPanel(id);
                }
              }}
            >
              {content && content(panelControl)}
            </ResizablePanel>
          )}
          
          {/ Only add handle between panels, not after the last one /}
          {index < panels.length - 1 && (
            <ResizableHandle className="hover:bg-sky-500" withHandle />
          )}
        </React.Fragment>
      ))}
    </ResizablePanelGroup>
  );
};

// Create a layout panel component for the example
export const PanelLayout: React.FC<{ panels: PanelProps[] }> = ({ panels }) => {
  return (
    <PanelProvider>
      <div className="h-screen w-full">
        <RenderPanels panels={panels} />
      </div>
    </PanelProvider>
  );
};

// Example of how to use the component with cross-panel control
export const PanelLayoutExample: React.FC = () => {
  // Example panel configuration
  const panelsConfig: PanelProps[] = [
    {
      id: 'sidebar',
      defaultSize: 20,
      minSize: 10,
      collapsible: true,
      collapsedSize: 5,
      content: (control) => {
        const isCollapsed = control.isCollapsed('sidebar');
        
        return (
          <div className="h-full">
            <div className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-800">
              {!isCollapsed && <span className="font-medium">Navigation</span>}
              <button 
                onClick={() => control.togglePanel('sidebar')}
                className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                {isCollapsed ? "→" : "←"}
              </button>
            </div>
            
            {!isCollapsed && (
              <div className="p-2">
                <nav className="space-y-2">
                  <div className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer">
                    Dashboard
                  </div>
                  <div className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer">
                    Projects
                  </div>
                  <div className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer">
                    Settings
                  </div>
                </nav>
                
                <div className="mt-6 space-y-2">
                  <h4 className="text-sm font-medium">Panel Controls</h4>
                  <button 
                    onClick={() => control.togglePanel('inspector')}
                    className="p-2 w-full text-left rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
                  >
                    Toggle Inspector
                  </button>
                  
                  <button 
                    onClick={() => {
                      // Example of controlling multiple panels
                      if (control.isCollapsed('console')) {
                        control.expandPanel('console');
                      } else {
                        control.collapsePanel('console');
                      }
                    }}
                    className="p-2 w-full text-left rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
                  >
                    Toggle Console
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }
    },
    {
      id: 'main',
      defaultSize: 60,
      minSize: 30,
      direction: 'vertical',
      children: [
        {
          id: 'content',
          defaultSize: 70,
          content: (control) => (
            <div className="p-4">
              <h2 className="text-lg font-bold mb-2">Main Content</h2>
              <p>This demonstrates panels that can control each other.</p>
              <p className="mt-2">Try using these controls:</p>
              
              <div className="mt-4 space-x-2">
                <button 
                  onClick={() => {
                    control.collapsePanel('sidebar');
                    control.collapsePanel('inspector');
                  }}
                  className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Focus Mode
                </button>
                
                <button 
                  onClick={() => {
                    control.expandPanel('sidebar');
                    control.expandPanel('inspector');
                  }}
                  className="px-3 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
                >
                  Show All Panels
                </button>
                
                <button 
                  onClick={() => {
                    if (control.isCollapsed('console')) {
                      control.expandPanel('console');
                    } else {
                      control.collapsePanel('console');
                    }
                  }}
                  className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  Toggle Console
                </button>
              </div>
            </div>
          )
        },
        {
          id: 'console',
          defaultSize: 30,
          minSize: 10,
          collapsible: true,
          collapsedSize: 5,
          content: (control) => {
            const isCollapsed = control.isCollapsed('console');
            
            return (
              <div className="h-full">
                <div className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-800">
                  {!isCollapsed && <span className="font-medium">Console</span>}
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => control.togglePanel('console')}
                      className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      {isCollapsed ? "↓" : "↑"}
                    </button>
                  </div>
                </div>
                
                {!isCollapsed && (
                  <div className="p-2 bg-black text-green-500 font-mono text-sm h-full overflow-auto">
                    <div>$ npm install react-resizable-panels</div>
                    <div>+ react-resizable-panels@1.0.0</div>
                    <div>added 1 package in 2s</div>
                    <div>$</div>
                    <div className="mt-2">
                      <button 
                        onClick={() => {
                          control.togglePanel('inspector');
                        }}
                        className="text-white bg-gray-800 px-2 py-1 rounded"
                      >
                        Toggle Inspector Panel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }
        }
      ]
    },
    {
      id: 'inspector',
      defaultSize: 20,
      minSize: 15,
      collapsible: true,
      collapsedSize: 5,
      content: (control) => {
        const isCollapsed = control.isCollapsed('inspector');
        
        return (
          <div className="h-full">
            <div className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-800">
              {!isCollapsed && <span className="font-medium">Inspector</span>}
              <button 
                onClick={() => control.togglePanel('inspector')}
                className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                {isCollapsed ? "←" : "→"}
              </button>
            </div>
            
            {!isCollapsed && (
              <div className="p-4">
                <div className="space-y-3">
                  <h3 className="font-medium">Properties</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Width</span>
                      <span>250px</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Height</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      onClick={() => {
                        // Close sidebar from inspector
                        control.collapsePanel('sidebar');
                      }}
                      className="p-2 w-full text-left rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
                    >
                      Close Sidebar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }
    }
  ];

  return <PanelLayout panels={panelsConfig} />;
};
 */
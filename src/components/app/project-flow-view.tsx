
"use client";

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type DefaultEdgeOptions,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { CloudPage } from '@/lib/types';
import dagre from '@dagrejs/dagre';
import { Button } from '../ui/button';
import { GitFork, Maximize, Minus, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CustomNodeData {
  label: string;
  pageId: string;
  status: 'published' | 'draft';
  onNodeClick: (pageId: string) => void;
}

const CustomNode = ({ data }: { data: CustomNodeData }) => {
  const { label, pageId, status, onNodeClick } = data;
  return (
    <div 
      onClick={() => onNodeClick(pageId)}
      className="bg-card p-4 rounded-lg border-2 shadow-md hover:shadow-lg hover:border-primary transition-all cursor-pointer w-[200px]"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
        <h4 className="text-base font-semibold truncate">{label}</h4>
      </div>
      <p className="text-xs text-muted-foreground">Clique para editar</p>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 150 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';
    node.position = {
      x: nodeWithPosition.x - 100,
      y: nodeWithPosition.y - 50,
    };
    return node;
  });

  return { nodes, edges };
};


interface ProjectFlowViewProps {
  pages: CloudPage[];
}

export function ProjectFlowView({ pages }: ProjectFlowViewProps) {
  const router = useRouter();

  const handleNodeClick = (pageId: string) => {
     router.push(`/editor/${pageId}`);
  };

  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node<CustomNodeData>[] = pages.map((page, index) => ({
      id: page.id,
      type: 'custom',
      data: { 
        label: page.name, 
        pageId: page.id, 
        status: page.status || 'draft',
        onNodeClick: handleNodeClick 
      },
      position: { x: index * 250, y: 100 }, // Initial position
    }));

    const edges: Edge[] = [];
    pages.forEach(page => {
      page.components.forEach(component => {
        // Check for Button and Form components with a page link action
        if ((component.type === 'Button' || component.type === 'Form') && component.props.action?.type === 'PAGE') {
          const targetPageId = component.props.action.pageId;
          if (targetPageId) {
            edges.push({
              id: `e-${page.id}-${targetPageId}-${component.id}`,
              source: page.id,
              target: targetPageId,
              type: 'smoothstep',
              animated: true,
              markerEnd: {
                type: 'arrowclosed',
              },
            });
          }
        }
      });
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);

    return { initialNodes: layoutedNodes, initialEdges: layoutedEdges };
  }, [pages]);

  if (pages.length === 0) {
    return (
        <div className="text-center py-16">
            <GitFork size={48} className="mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Nenhum fluxo para exibir</h2>
            <p className="mt-2 text-muted-foreground">Crie páginas e conecte-as com botões para visualizar a jornada do seu usuário aqui.</p>
        </div>
    );
  }

  return (
    <div style={{ height: '75vh', width: '100%' }} className="rounded-lg border bg-card">
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { HierarchyNode, Response } from '../../models/data.models';

// Módulos de PrimeNG
import { TreeModule } from 'primeng/tree';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-explorer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TreeModule,
    TableModule,
    CardModule,
    ButtonModule,
    TagModule
  ],
  templateUrl: './explorer.component.html',
  styleUrl: './explorer.component.css'
})
export class ExplorerComponent implements OnInit {
  dataService = inject(DataService);

  // Data Signals
  nodes = signal<TreeNode[]>([]);
  responses = this.dataService.currentResponses;
  selectedNode: TreeNode | null = null;
  loading = false;

  ngOnInit() {
    this.loadHierarchy();
  }

  loadHierarchy() {
    this.loading = true;
    this.dataService.getHierarchy().subscribe({
      next: (data) => {
        this.nodes.set(this.transformToTreeNodes(data));
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  // Transform backend DTO to PrimeNG TreeNode
  transformToTreeNodes(data: HierarchyNode[]): TreeNode[] {
    return data.map(cat => ({
      key: cat.key,
      label: cat.label,
      expandedIcon: 'pi pi-folder-open',
      collapsedIcon: 'pi pi-folder',
      children: cat.children?.map(q => ({
        key: q.key,
        label: q.label,
        icon: 'pi pi-question-circle',
        data: q.data, // This is the QuestionId
        leaf: true
      }))
    }));
  }

  onNodeSelect(event: any) {
    if (event.node.leaf) {
      const questionId = event.node.data;
      this.dataService.getResponses(questionId).subscribe();
    }
  }

  refresh() {
    this.loadHierarchy();
  }
}

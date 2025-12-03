import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Question, Response } from '../../models/data.models';

// PrimeNG Modules
import { ListboxModule } from 'primeng/listbox';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-explorer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ListboxModule,
    TabViewModule,
    TableModule,
    CardModule,
    InputTextModule,
    TagModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './explorer.component.html',
  styleUrl: './explorer.component.css'
})
export class ExplorerComponent implements OnInit {
  dataService = inject(DataService);

  // Data
  questions = this.dataService.questions;
  selectedQuestion: Question | null = null;
  responses = this.dataService.currentResponses;

  // Search Filter
  filterText = signal('');

  // Computed: Group responses by Category for Tabs
  groupedResponses = computed(() => {
    const current = this.responses();
    if (!current.length) return [];

    // Group by categoryName
    const groups = current.reduce((acc, resp) => {
      const cat = resp.categoryName || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(resp);
      return acc;
    }, {} as Record<string, Response[]>);

    return Object.keys(groups).map(key => ({
      category: key,
      items: groups[key]
    }));
  });

  filteredQuestions = computed(() => {
    const text = this.filterText().toLowerCase();
    return this.questions().filter(q => q.text.toLowerCase().includes(text));
  });

  ngOnInit() {
    this.dataService.getQuestions().subscribe();
  }

  onQuestionSelect(event: any) {
    if (event.value) {
      this.dataService.getResponses(event.value.id).subscribe();
    }
  }
}

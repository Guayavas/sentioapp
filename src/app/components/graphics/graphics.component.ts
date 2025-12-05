import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ChartModule } from 'primeng/chart';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-graphics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    ChartModule,
    AutoCompleteModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './graphics.component.html',
  styleUrl: './graphics.component.css'
})
export class GraphicsComponent implements OnInit {
  dataService = inject(DataService);
  messageService = inject(MessageService);

  // Opciones de Filtro (Cargadas desde API)
  options: any = {
    sedes: [],
    programas: [],
    sexos: [],
    orientaciones: [],
    etnias: [],
    categorias: []
  };

  // Filtros Seleccionados
  filters = {
    sede: 'Todas',
    programa: 'Todas',
    sexoBiologico: 'Todas',
    orientacionSexual: 'Todas',
    grupoEtnico: 'Todas',
    categoria: 'Todas',
    question: null as any, // Objeto completo de pregunta seleccionada
    groupBy: 'Categoría',
    chartType: 'Barras'
  };

  // Listas estáticas
  chartTypes = [
    { label: 'Barras', value: 'Barras' },
    { label: 'Pastel', value: 'Pastel' },
    { label: 'Anillo', value: 'Anillo' }
  ];

  groupOptions = [
    { label: 'Categoría', value: 'Categoría' },
    { label: 'Sede', value: 'Sede' },
    { label: 'Programa', value: 'Programa' },
    { label: 'Sexo Biológico', value: 'Sexo Biológico' },
    { label: 'Orientación Sexual', value: 'Orientación Sexual' },
    { label: 'Grupo Étnico', value: 'Grupo Étnico' }
  ];

  // Búsqueda de Preguntas
  filteredQuestions: any[] = [];
  allQuestions: any[] = [];

  // Datos de la Gráfica
  chartData: any;
  chartOptions: any;

  ngOnInit() {
    this.loadFilters();
    this.loadQuestions();
  }

  loadFilters() {
    this.dataService.getFilterOptions().subscribe(data => {
      this.options = data;
    });
  }

  loadQuestions() {
    this.dataService.getQuestions().subscribe(data => {
      this.allQuestions = data;
    });
  }

  filterQuestion(event: any) {
    const query = event.query.toLowerCase();
    this.filteredQuestions = this.allQuestions.filter(q => q.text.toLowerCase().includes(query));
  }

  generateChart() {
    // Preparar payload
    const payload = {
      ...this.filters,
      questionId: this.filters.question ? this.filters.question.id : null
    };

    this.dataService.getChartData(payload).subscribe({
      next: (result) => {
        this.updateChartConfig(result, this.filters.chartType);
        this.messageService.add({ severity: 'success', summary: 'Gráfica Generada', detail: result.title });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar la gráfica' });
      }
    });
  }

  updateChartConfig(data: any, type: string) {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    // Paleta de colores
    const backgroundColors = [
        documentStyle.getPropertyValue('--blue-500'),
        documentStyle.getPropertyValue('--yellow-500'),
        documentStyle.getPropertyValue('--green-500'),
        documentStyle.getPropertyValue('--pink-500'),
        documentStyle.getPropertyValue('--cyan-500'),
        documentStyle.getPropertyValue('--orange-500'),
        documentStyle.getPropertyValue('--purple-500')
    ];

    // Configurar Dataset
    const dataset = {
        label: 'Cantidad',
        data: data.values,
        backgroundColor: type === 'Barras' ? documentStyle.getPropertyValue('--primary-color') : backgroundColors,
        borderColor: type === 'Barras' ? documentStyle.getPropertyValue('--primary-color') : backgroundColors,
        borderWidth: 1
    };

    this.chartData = {
        labels: data.labels,
        datasets: [dataset]
    };

    // Configurar Opciones según tipo
    const baseOptions = {
        plugins: {
            legend: {
                labels: { color: textColor },
                display: type !== 'Barras' // Ocultar leyenda en barras si solo hay una serie
            },
            title: {
                display: true,
                text: [data.title, data.subTitle],
                color: textColor,
                font: { size: 16 }
            }
        },
        scales: type === 'Barras' ? {
            y: {
                beginAtZero: true,
                ticks: { color: textColor },
                grid: { color: surfaceBorder }
            },
            x: {
                ticks: { color: textColor },
                grid: { color: surfaceBorder }
            }
        } : {}
    };

    // Mapeo tipo string -> tipo chart.js
    let chartJsType = 'bar';
    if (type === 'Pastel') chartJsType = 'pie';
    if (type === 'Anillo') chartJsType = 'doughnut';

    this.chartOptions = baseOptions;

    // Forzamos la actualización del tipo en la vista si fuera necesario,
    // pero p-chart usa [type] input. Lo manejaremos en el HTML.
  }

  getChartJsType() {
      if (this.filters.chartType === 'Pastel') return 'pie';
      if (this.filters.chartType === 'Anillo') return 'doughnut';
      return 'bar';
  }
}

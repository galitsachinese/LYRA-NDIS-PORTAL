import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'category' | 'status' | 'view' | 'action';
}

import { ViewIconComponent } from '../../components/icons/svg-icons/view-icon';

@Component({
  selector: 'app-table-ui',
  standalone: true,
  imports: [CommonModule, ViewIconComponent],
  templateUrl: './table.ui.html',
  styleUrls: ['./table.ui.css'],
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];

  @Output() viewAction = new EventEmitter<any>();
  @Output() cancelAction = new EventEmitter<any>();

  activeMenuRow: any = null;

  constructor(private eRef: ElementRef) {}

  getValue(row: any, key: string): any {
    return row ? row[key] : '';
  }

  toggleMenu(row: any): void {
    this.activeMenuRow = this.activeMenuRow === row ? null : row;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.activeMenuRow = null;
    }
  }
}

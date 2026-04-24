import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PaginationUIComponent } from '../../ui/pagination/pagination.ui';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [PaginationUIComponent],
  template: `
    <app-pagination-ui
      [currentPage]="currentPage"
      [totalPages]="totalPages"
      (pageChange)="onPageChange($event)"
    >
    </app-pagination-ui>
  `,
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  onPageChange(page: number) {
    this.pageChange.emit(page);
  }
}

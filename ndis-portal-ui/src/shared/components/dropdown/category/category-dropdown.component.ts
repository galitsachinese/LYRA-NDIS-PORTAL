import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DropdownUIComponent,
  DropdownOption,
} from '../../../ui/dropdown/dropdown.ui';
import { CategoryIconComponent } from '../../icons/svg-icons/category-icon';

@Component({
  selector: 'app-category-dropdown',
  standalone: true,
  imports: [CommonModule, DropdownUIComponent, CategoryIconComponent],
  template: `
    <app-dropdown-ui
      label="Category"
      [options]="categoryOptions"
      (onSelect)="handleSelect($event)"
    >
      <app-icon-category
        icon
        [size]="16"
        class="status-icon"
      ></app-icon-category>
    </app-dropdown-ui>
  `,
})
export class CategoryDropdownComponent {
  @Output() categoryChange = new EventEmitter<string>();

  categoryOptions: DropdownOption[] = [
    { label: 'All Categories', value: 'all' },
    { label: 'Personal Hygiene', value: 'hygiene' },
    { label: 'Daily Activities', value: 'activities' },
    { label: 'Transport', value: 'transport' },
  ];

  handleSelect(value: string) {
    this.categoryChange.emit(value);
  }
}

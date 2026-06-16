import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-bar.component.html', // Ensure this points to your file
})
export class FilterBarComponent {
  // These MUST match the attributes in the HTML
  @Input() categoryOptions: { label: string; value: string }[] = [];
  @Input() selectedValue: string = 'all';

  // This emits the string back to the parent
  @Output() select = new EventEmitter<string>();

  handleSelect(value: string): void {
    this.select.emit(value);
  }

  trackByValue(index: number, item: any): string {
    return item.value;
  }
}

import { Component, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CategoryOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-category-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-dropdown.component.html',
  styleUrls: ['./category-dropdown.component.css'],
})
export class CategoryDropdownComponent implements OnChanges {
  @Output() categoryChange = new EventEmitter<string>();
  @Input() services: any[] = [];

  selectedValue = 'all';
  categoryOptions: CategoryOption[] = [
    { label: 'All', value: 'all' },
  ];

  ngOnChanges() {
    this.updateCategoryOptions();
  }

  updateCategoryOptions() {
    if (!this.services || this.services.length === 0) {
      this.categoryOptions = [{ label: 'All Categories', value: 'all' }];
      this.selectedValue = 'all';
      return;
    }

    const uniqueCategories = new Map<string, string>();
    this.services.forEach(service => {
      if (service.category) {
        const label = String(service.category).trim();

        if (label) {
          uniqueCategories.set(this.normalizeCategory(label), label);
        }
      }
    });

    const activeCategories = Array.from(uniqueCategories.values()).sort((a, b) =>
      a.localeCompare(b),
    );

    this.categoryOptions = [
      { label: 'All Categories', value: 'all' },
      ...activeCategories.map(category => ({
        label: category,
        value: this.normalizeCategory(category),
      }))
    ];

    if (!this.categoryOptions.some(option => option.value === this.selectedValue)) {
      this.selectedValue = 'all';
    }
  }

  handleSelect(value: string) {
    this.selectedValue = value;
    this.categoryChange.emit(value);
  }

  trackByValue(_index: number, option: CategoryOption) {
    return option.value;
  }

  private normalizeCategory(category: string) {
    return category.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  }
}

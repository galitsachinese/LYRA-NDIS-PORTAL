import {
  Component,
  Output,
  EventEmitter,
  Input,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterIconComponent } from '../../icons/svg-icons/filter-icon';

@Component({
  selector: 'app-status-dropdown',
  standalone: true,
  imports: [CommonModule, FilterIconComponent],
  templateUrl: './status-dropdown.component.html',
})
export class StatusDropdownComponent {
  @Input() activeStatus: string = 'all';
  @Output() statusChange = new EventEmitter<string>();

  isOpen = false;

  statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Approved', value: 'approved' },
    { label: 'Pending', value: 'pending' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  constructor(private el: ElementRef) {}

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggle(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  handleSelect(value: string, event: Event) {
    event.stopPropagation();
    this.activeStatus = value;
    this.statusChange.emit(value);
    this.isOpen = false;
  }

  getSelectedLabel(): string {
    const selected = this.statusOptions.find(
      (o) => o.value === this.activeStatus,
    );
    return selected ? selected.label : 'Status';
  }
}

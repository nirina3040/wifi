import { Component, OnInit } from '@angular/core';
import { WifiInfo } from '../scanner/scanner.component';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  historyList: WifiInfo[] = [];
  filteredList: WifiInfo[] = [];
  searchTerm: string = '';
  selectedItem: WifiInfo | null = null;
  showPasswordInDetails: boolean = false; // Ajout de cette propriété

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    const stored = localStorage.getItem('wifi_history');
    this.historyList = stored ? JSON.parse(stored) : [];
    this.filteredList = [...this.historyList];
  }

  search() {
    if (!this.searchTerm.trim()) {
      this.filteredList = [...this.historyList];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredList = this.historyList.filter(item => 
      item.ssid.toLowerCase().includes(term) ||
      item.password.toLowerCase().includes(term)
    );
  }

  clearHistory() {
    if (confirm('Êtes-vous sûr de vouloir supprimer tout l\'historique ?')) {
      localStorage.removeItem('wifi_history');
      this.historyList = [];
      this.filteredList = [];
      this.selectedItem = null;
    }
  }

  deleteItem(index: number) {
    this.historyList.splice(index, 1);
    localStorage.setItem('wifi_history', JSON.stringify(this.historyList));
    this.loadHistory();
    if (this.selectedItem === this.historyList[index]) {
      this.selectedItem = null;
    }
  }

  viewDetails(item: WifiInfo) {
    this.selectedItem = item;
    this.showPasswordInDetails = false; // Reset password visibility when viewing new item
  }

  closeDetails() {
    this.selectedItem = null;
    this.showPasswordInDetails = false;
  }

  togglePasswordVisibility() {
    this.showPasswordInDetails = !this.showPasswordInDetails;
    // Update input type
    const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = this.showPasswordInDetails ? 'text' : 'password';
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    // Feedback visuel
    const toast = document.getElementById('historyToast');
    if (toast) {
      const bsToast = new (window as any).bootstrap.Toast(toast);
      bsToast.show();
    }
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
import { Component, OnDestroy } from '@angular/core';
import { Html5Qrcode } from 'html5-qrcode';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

export interface WifiInfo {
  ssid: string;
  encryption: string;
  password: string;
  hidden: boolean;
  timestamp: Date;
  signalStrength?: number;
  securityLevel?: 'high' | 'medium' | 'low';
}

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css']
})
export class ScannerComponent implements OnDestroy {
  html5QrCode: Html5Qrcode | null = null;
  wifiInfo: WifiInfo | null = null;
  errorMessage: string = '';
  isProcessing: boolean = false;
  showPassword: boolean = false;
  selectedFile: File | null = null;
  dragOver: boolean = false;
  imagePreviewUrl: SafeUrl | null = null;
  rawQrContent: string = '';
  isScanningSuccess: boolean = false;

  constructor(private sanitizer: DomSanitizer) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.validateAndProcessFile(file);
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validateAndProcessFile(files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
  }

  validateAndProcessFile(file: File) {
    if (!file.type.match(/image\/(jpeg|png|jpg|webp)/)) {
      this.errorMessage = 'Format non supporté. Utilisez JPEG, PNG ou WEBP';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'Image trop volumineuse (max 5MB)';
      return;
    }

    this.selectedFile = file;
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl as string);
    }
    this.imagePreviewUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
    this.processImage(file);
  }

  async processImage(file: File) {
    this.isProcessing = true;
    this.errorMessage = '';
    this.wifiInfo = null;
    this.rawQrContent = '';
    this.isScanningSuccess = false;

    try {
      this.html5QrCode = new Html5Qrcode('qr-image-reader');
      const decodedText = await this.html5QrCode.scanFile(file, false);
      
      if (decodedText) {
        this.rawQrContent = decodedText;
        console.log('QR Content:', decodedText);
        this.parseAndSaveWifiInfo(decodedText);
      } else {
        this.errorMessage = 'Aucun QR code détecté dans l\'image';
      }
    } catch (error) {
      console.error('Erreur:', error);
      this.errorMessage = 'Lecture impossible. Vérifiez la netteté de l\'image';
    } finally {
      this.isProcessing = false;
      if (this.html5QrCode) {
        this.html5QrCode.clear();
      }
    }
  }

  parseAndSaveWifiInfo(decodedText: string) {
    const parsed = this.parseWifiQR(decodedText);
    
    if (parsed && parsed.ssid && parsed.password) {
      this.wifiInfo = {
        ...parsed,
        timestamp: new Date(),
        securityLevel: this.getSecurityLevel(parsed.encryption)
      };
      this.errorMessage = '';
      this.isScanningSuccess = true;
      this.saveToHistory();
      
      // Animation de succès
      this.playSuccessSound();
    } else {
      this.errorMessage = `Format WiFi non reconnu`;
      this.wifiInfo = null;
      this.isScanningSuccess = false;
    }
  }

  parseWifiQR(qrText: string): Omit<WifiInfo, 'timestamp' | 'securityLevel'> | null {
    let cleanText = qrText.trim();
    
    // Recherche du pattern WIFI:
    const wifiMatch = cleanText.match(/WIFI:(.*)/i);
    if (!wifiMatch) return null;
    
    const content = wifiMatch[1];
    
    // Extraction des champs avec différents séparateurs
    const fields: { [key: string]: string } = {};
    
    // Pattern pour extraire les champs (supporte les guillemets)
    const fieldPattern = /([A-Z]):"?(.*?)"?(?=;[A-Z]:|$|;)/gi;
    let match;
    
    while ((match = fieldPattern.exec(content)) !== null) {
      let value = match[2].trim();
      // Nettoyer les guillemets et points-virgules en fin
      value = value.replace(/^"|"$|;$|\\;$/g, '');
      fields[match[1].toUpperCase()] = value;
    }
    
    // Alternative: parsing manuel plus robuste
    if (Object.keys(fields).length === 0) {
      const sMatch = content.match(/S:([^;]+)/i);
      const pMatch = content.match(/P:([^;]+)/i);
      const tMatch = content.match(/T:([^;]+)/i);
      const hMatch = content.match(/H:([^;]+)/i);
      
      if (sMatch) fields['S'] = sMatch[1].replace(/^"|"$/g, '');
      if (pMatch) fields['P'] = pMatch[1].replace(/^"|"$/g, '');
      if (tMatch) fields['T'] = tMatch[1].replace(/^"|"$/g, '');
      if (hMatch) fields['H'] = hMatch[1];
    }
    
    console.log('Champs extraits:', fields);
    
    // Vérifier les champs obligatoires
    if (!fields['S'] || !fields['P']) {
      return null;
    }
    
    let encryption = fields['T'] || 'WPA';
    // Normaliser le type de chiffrement
    if (encryption.toUpperCase() === 'WPA') encryption = 'WPA2/WPA3';
    if (encryption.toUpperCase() === 'NONE') encryption = 'Aucun (Open)';
    
    return {
      ssid: this.decodeWifiString(fields['S']),
      encryption: encryption,
      password: this.decodeWifiString(fields['P']),
      hidden: fields['H'] === 'true' || fields['H'] === '1'
    };
  }

  getSecurityLevel(encryption: string): 'high' | 'medium' | 'low' {
    const enc = encryption.toUpperCase();
    if (enc.includes('WPA3')) return 'high';
    if (enc.includes('WPA2')) return 'high';
    if (enc.includes('WPA')) return 'medium';
    if (enc.includes('WEP')) return 'low';
    return 'low';
  }

  decodeWifiString(encoded: string): string {
    if (!encoded) return '';
    return encoded
      .replace(/\\;/g, ';')
      .replace(/\\,/g, ',')
      .replace(/\\\\/g, '\\')
      .replace(/\\:/g, ':')
      .replace(/\\"/g, '"')
      .replace(/\\n/g, ' ')
      .trim();
  }

  playSuccessSound() {
    // Optionnel: jouer un son de succès
    const audio = new Audio('data:audio/wav;base64,U3RlYWx0aCBzb3VuZA==');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio non supporté'));
  }

  getSecurityBadgeClass(level: string): string {
    switch(level) {
      case 'high': return 'bg-success';
      case 'medium': return 'bg-info';
      case 'low': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  getSecurityIcon(level: string): string {
    switch(level) {
      case 'high': return 'bi-shield-check';
      case 'medium': return 'bi-shield';
      case 'low': return 'bi-shield-exclamation';
      default: return 'bi-shield';
    }
  }

  resetScanner() {
    this.wifiInfo = null;
    this.errorMessage = '';
    this.showPassword = false;
    this.selectedFile = null;
    this.rawQrContent = '';
    this.isScanningSuccess = false;
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl as string);
      this.imagePreviewUrl = null;
    }
    this.dragOver = false;
  }

  saveToHistory() {
    if (this.wifiInfo) {
      const history = this.getHistory();
      history.unshift(this.wifiInfo);
      if (history.length > 50) history.pop();
      localStorage.setItem('wifi_history', JSON.stringify(history));
    }
  }

  getHistory(): WifiInfo[] {
    const stored = localStorage.getItem('wifi_history');
    return stored ? JSON.parse(stored) : [];
  }

  copyPassword() {
    if (this.wifiInfo?.password) {
      navigator.clipboard.writeText(this.wifiInfo.password);
      this.showNotification('Mot de passe copié !', 'success');
    }
  }

  copySSID() {
    if (this.wifiInfo?.ssid) {
      navigator.clipboard.writeText(this.wifiInfo.ssid);
      this.showNotification('SSID copié !', 'success');
    }
  }

  showNotification(message: string, type: 'success' | 'error') {
    const toast = document.getElementById('notificationToast');
    if (toast) {
      const toastBody = toast.querySelector('.toast-body');
      if (toastBody) toastBody.textContent = message;
      const bsToast = new (window as any).bootstrap.Toast(toast);
      bsToast.show();
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPasswordStrength(password: string): { text: string; class: string; width: number } {
    const length = password.length;
    const hasNumbers = /\d/.test(password);
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    let strength = 0;
    if (length >= 8) strength++;
    if (length >= 12) strength++;
    if (hasNumbers) strength++;
    if (hasLetters) strength++;
    if (hasSpecial) strength++;
    
    const percent = (strength / 5) * 100;
    
    if (strength <= 2) return { text: 'Faible', class: 'bg-danger', width: percent };
    if (strength <= 3) return { text: 'Moyen', class: 'bg-warning', width: percent };
    return { text: 'Fort', class: 'bg-success', width: percent };
  }

  ngOnDestroy() {
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl as string);
    }
    if (this.html5QrCode) {
      this.html5QrCode.clear();
    }
  }
}
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  version: string = '2.0.0';
  
  features = [
    {
      icon: 'bi-qr-code-scan',
      title: 'Scan intelligent',
      description: 'Reconnaît automatiquement les QR codes WiFi quel que soit leur format'
    },
    {
      icon: 'bi-shield-check',
      title: '100% local',
      description: 'Aucune donnée n\'est envoyée sur internet, tout reste sur votre appareil'
    },
    {
      icon: 'bi-clock-history',
      title: 'Historique',
      description: 'Sauvegarde automatique des réseaux scannés pour un accès rapide'
    },
    {
      icon: 'bi-image',
      title: 'Import facile',
      description: 'Glissez-déposez vos captures d\'écran ou importez-les manuellement'
    },
    {
      icon: 'bi-copy',
      title: 'Copie rapide',
      description: 'Copiez SSID et mot de passe en un clic'
    },
    {
      icon: 'bi-shield-lock',
      title: 'Sécurisé',
      description: 'Mots de passe masqués par défaut, affichage à la demande'
    }
  ];

  steps = [
    {
      number: '01',
      title: 'Capture d\'écran',
      description: 'Prenez une photo nette du QR code WiFi que vous souhaitez scanner',
      icon: 'bi-camera'
    },
    {
      number: '02',
      title: 'Importez l\'image',
      description: 'Glissez-déposez l\'image dans la zone prévue ou cliquez pour parcourir vos fichiers',
      icon: 'bi-cloud-upload'
    },
    {
      number: '03',
      title: 'Analyse automatique',
      description: 'L\'application détecte et décode automatiquement le QR code',
      icon: 'bi-gear'
    },
    {
      number: '04',
      title: 'Récupérez les infos',
      description: 'Visualisez le SSID et le mot de passe, puis connectez-vous',
      icon: 'bi-wifi'
    }
  ];

  legalConditions = [
    {
      title: 'Utilisation légale',
      description: 'Cette application est conçue uniquement pour scanner vos propres QR codes WiFi ou ceux pour lesquels vous avez une autorisation explicite.',
      icon: 'bi-gavel'
    },
    {
      title: 'Confidentialité',
      description: 'Aucune donnée n\'est collectée ou transmise à des serveurs externes. Tout le traitement est effectué localement sur votre appareil.',
      icon: 'bi-incognito'
    },
    {
      title: 'Responsabilité',
      description: 'L\'utilisateur est seul responsable de l\'utilisation de cette application et du respect des lois en vigueur concernant l\'accès aux réseaux WiFi.',
      icon: 'bi-file-check'
    },
    {
      title: 'Stockage local',
      description: 'L\'historique des scans est stocké uniquement dans votre navigateur et peut être effacé à tout moment.',
      icon: 'bi-database'
    }
  ];

  technologies = [
    { name: 'Angular 17', icon: 'angular', color: '#DD0031' },
    { name: 'Bootstrap 5', icon: 'bootstrap', color: '#7952B3' },
    { name: 'HTML5 QR Code', icon: 'qr-code', color: '#34A853' },
    { name: 'TypeScript', icon: 'file-code', color: '#3178C6' }
  ];

  constructor() { }

  ngOnInit(): void { }

  scrollToScanner() {
    // Navigation vers le scanner
    window.location.href = '/scanner';
  }
}
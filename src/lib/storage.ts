import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface FileUploadResult {
  url: string;
  path: string;
  contentType: string;
  size: number;
}

export class StorageService {
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    bucketName = 'ebf-bouake'
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.bucketName = bucketName;
  }

  /**
   * Initialise le bucket de stockage s'il n'existe pas
   */
  async initializeBucket(): Promise<void> {
    try {
      // Vérifier si le bucket existe
      const { data: buckets, error } = await this.supabase.storage.getBucket(this.bucketName);
      
      if (error && error.message.includes('Not found')) {
        // Créer le bucket s'il n'existe pas
        const { data, error: createError } = await this.supabase.storage.createBucket(this.bucketName, {
          public: true,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            'audio/mp4',
            'audio/webm'
          ]
        });
        
        if (createError) {
          console.error('Erreur lors de la création du bucket:', createError);
          throw new Error('Impossible de créer le bucket de stockage');
        }
        
        console.log('✅ Bucket créé avec succès:', this.bucketName);
      } else {
        console.log('✅ Bucket existant trouvé:', this.bucketName);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du bucket:', error);
      throw new Error('Impossible d\'initialiser le bucket de stockage');
    }
  }

  /**
   * Upload un fichier vers Supabase Storage
   */
  async uploadFile(
    file: Buffer | File,
    filename: string,
    options: {
      contentType?: string;
      addRandomSuffix?: boolean;
    } = {}
  ): Promise<FileUploadResult> {
    let { contentType, addRandomSuffix = true } = options;
    
    // Si c'est un File et que contentType n'est pas spécifié, utiliser le type du fichier
    if (file instanceof File && !contentType) {
      contentType = file.type;
    }
    
    // Générer un nom de fichier unique si nécessaire
    const finalFilename = addRandomSuffix 
      ? `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${filename}`
      : filename;

    try {
      // Convertir File en Buffer si nécessaire
      let buffer: Buffer;
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        buffer = file;
      }

      // S'assurer que contentType est défini
      if (!contentType) {
        contentType = 'application/octet-stream';
      }

      // Upload vers Supabase
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(finalFilename, buffer, {
          contentType,
          upsert: false
        });

      if (error) {
        console.error('Erreur lors de l\'upload:', error);
        throw new Error('Impossible d\'uploader le fichier');
      }

      // Obtenir l'URL publique
      const { data: publicUrlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);

      return {
        url: publicUrlData.publicUrl,
        path: data.path,
        contentType: contentType || 'application/octet-stream',
        size: buffer.length,
      };
    } catch (error) {
      console.error('Erreur lors de l\'upload du fichier:', error);
      throw new Error('Impossible d\'uploader le fichier');
    }
  }

  /**
   * Upload une image
   */
  async uploadImage(
    image: Buffer | File,
    filename: string
  ): Promise<FileUploadResult> {
    let contentType: string;
    
    // Si c'est un File, utiliser son type s'il est disponible
    if (image instanceof File && image.type && image.type.startsWith('image/')) {
      contentType = image.type;
    } else {
      // Sinon, déterminer à partir de l'extension
      const imageTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
      };

      const ext = filename.toLowerCase().match(/\.[0-9a-z]+$/)?.[0] || '.jpg';
      contentType = imageTypes[ext as keyof typeof imageTypes] || 'image/jpeg';
    }

    return this.uploadFile(image, filename, {
      contentType,
      addRandomSuffix: true,
    });
  }

  /**
   * Upload un fichier audio
   */
  async uploadAudio(
    audio: Buffer | File,
    filename: string
  ): Promise<FileUploadResult> {
    let contentType: string;
    
    // Si c'est un File, utiliser son type s'il est disponible
    if (audio instanceof File && audio.type && audio.type.startsWith('audio/')) {
      contentType = audio.type;
    } else {
      // Sinon, déterminer à partir de l'extension
      const audioTypes = {
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.m4a': 'audio/mp4',
        '.webm': 'audio/webm',
      };

      const ext = filename.toLowerCase().match(/\.[0-9a-z]+$/)?.[0] || '.mp3';
      contentType = audioTypes[ext as keyof typeof audioTypes] || 'audio/mpeg';
    }

    return this.uploadFile(audio, filename, {
      contentType,
      addRandomSuffix: true,
    });
  }

  /**
   * Supprime un fichier
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        throw new Error('Impossible de supprimer le fichier');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      throw new Error('Impossible de supprimer le fichier');
    }
  }

  /**
   * Liste tous les fichiers
   */
  async listFiles(prefix?: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .list(prefix);

      if (error) {
        console.error('Erreur lors de la liste des fichiers:', error);
        throw new Error('Impossible de lister les fichiers');
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la liste des fichiers:', error);
      throw new Error('Impossible de lister les fichiers');
    }
  }

  /**
   * Valide un fichier image
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      return { valid: false, error: 'L\'image ne doit pas dépasser 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Type d\'image non supporté. Utilisez JPG, PNG, GIF ou WebP' 
      };
    }

    return { valid: true };
  }

  /**
   * Valide un fichier audio
   */
  validateAudio(file: File): { valid: boolean; error?: string } {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'audio/mpeg', 
      'audio/wav', 
      'audio/ogg', 
      'audio/mp4', 
      'audio/webm'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'L\'audio ne doit pas dépasser 50MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Type d\'audio non supporté. Utilisez MP3, WAV, OGG, M4A ou WebM' 
      };
    }

    return { valid: true };
  }
}

// Service de stockage factice pour le développement
class MockStorageService extends StorageService {
  constructor() {
    // Call parent constructor with dummy values
    super('https://dummy.supabase.co', 'dummy-key', 'mock-bucket');
  }

  async initializeBucket(): Promise<void> {
    console.log('🪣 Mock: Initialisation du bucket');
  }

  async uploadFile(
    file: Buffer | File,
    filename: string,
    options: {
      contentType?: string;
      addRandomSuffix?: boolean;
    } = {}
  ): Promise<FileUploadResult> {
    console.log('📤 Mock: Upload du fichier', filename);
    
    const finalFilename = options.addRandomSuffix 
      ? `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${filename}`
      : filename;

    // Simuler une URL locale
    const mockUrl = `/uploads/mock/${finalFilename}`;
    
    return {
      url: mockUrl,
      path: finalFilename,
      contentType: options.contentType || 'application/octet-stream',
      size: file instanceof File ? file.size : file.length,
    };
  }

  async uploadImage(
    image: Buffer | File,
    filename: string
  ): Promise<FileUploadResult> {
    console.log('📷 Mock: Upload de l\'image', filename);
    return this.uploadFile(image, filename, {
      contentType: 'image/jpeg',
      addRandomSuffix: true,
    });
  }

  async uploadAudio(
    audio: Buffer | File,
    filename: string
  ): Promise<FileUploadResult> {
    console.log('🎵 Mock: Upload de l\'audio', filename);
    return this.uploadFile(audio, filename, {
      contentType: 'audio/mpeg',
      addRandomSuffix: true,
    });
  }

  async deleteFile(path: string): Promise<void> {
    console.log('🗑️ Mock: Suppression du fichier', path);
  }

  async listFiles(prefix?: string): Promise<any[]> {
    console.log('📋 Mock: Liste des fichiers', prefix);
    return [];
  }

  validateImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      return { valid: false, error: 'L\'image ne doit pas dépasser 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Type d\'image non supporté. Utilisez JPG, PNG, GIF ou WebP' 
      };
    }

    return { valid: true };
  }

  validateAudio(file: File): { valid: boolean; error?: string } {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'audio/mpeg', 
      'audio/wav', 
      'audio/ogg', 
      'audio/mp4', 
      'audio/webm'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'L\'audio ne doit pas dépasser 50MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Type d\'audio non supporté. Utilisez MP3, WAV, OGG, M4A ou WebM' 
      };
    }

    return { valid: true };
  }
}

// Exporter une fonction pour créer le service
export function createStorageService(): StorageService {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Pour le développement, utiliser des valeurs par défaut si non configuré
  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️  Les variables Supabase ne sont pas configurées, utilisation du mode de développement');
    // Retourner un service factice pour le développement
    return new MockStorageService();
  }
  
  return new StorageService(supabaseUrl, supabaseKey);
}

// Exporter une instance singleton pour compatibilité
export const storageService = createStorageService();
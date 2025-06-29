import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { 
  Text, 
  TextInput, 
  Modal, 
  Portal, 
  Button, 
  ProgressBar,
  Card,
  Chip
} from 'react-native-paper';
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, Loader, Globe, Brain, Database } from 'lucide-react-native';
import { PropertyImporter, ImportProgress } from '@/utils/propertyImporter';
import { Property } from '@/types';

interface ImportModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: (property: Property) => void;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  openaiApiKey?: string;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  visible,
  onDismiss,
  onSuccess,
  supabaseUrl,
  supabaseAnonKey,
  openaiApiKey
}) => {
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = useState<any>(null);

  const handleImport = async () => {
    if (!importUrl.trim()) {
      Alert.alert('Error', 'Por favor ingresa una URL válida');
      return;
    }

    try {
      // Validate URL
      new URL(importUrl);
    } catch {
      Alert.alert('Error', 'URL inválida. Por favor verifica que sea una URL válida.');
      return;
    }

    setIsImporting(true);
    setProgress(null);
    setImportResult(null);

    // Check if we have Supabase configuration
    if (!supabaseUrl || !supabaseAnonKey) {
      // Fallback to basic import
      const basicProperty = PropertyImporter.createBasicProperty(importUrl);
      onSuccess(basicProperty);
      handleClose();
      return;
    }

    const importer = new PropertyImporter(supabaseUrl, supabaseAnonKey, openaiApiKey);

    const result = await importer.importProperty(importUrl, (progressUpdate) => {
      setProgress(progressUpdate);
    });

    setImportResult(result);

    if (result.success && result.property) {
      setTimeout(() => {
        onSuccess(result.property!);
        handleClose();
      }, 2000);
    } else {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setImportUrl('');
    setIsImporting(false);
    setProgress(null);
    setImportResult(null);
    onDismiss();
  };

  const getStepIcon = (step: string, isActive: boolean, isComplete: boolean, isError: boolean) => {
    if (isError) return <AlertCircle size={20} color="#ef4444" />;
    if (isComplete) return <CheckCircle size={20} color="#10b981" />;
    if (isActive) return <Loader size={20} color="#2563eb" />;
    return <div style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#e5e7eb' }} />;
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'direct': return <Globe size={16} color="#10b981" />;
      case 'scraperapi': return <Database size={16} color="#f59e0b" />;
      case 'openai': return <Brain size={16} color="#8b5cf6" />;
      default: return <Globe size={16} color="#6b7280" />;
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={styles.modalContainer}
      >
        <Text variant="titleLarge" style={styles.modalTitle}>
          Importar Propiedad desde URL
        </Text>
        
        <Text variant="bodyMedium" style={styles.modalSubtitle}>
          Pega la URL de una propiedad para importar automáticamente sus datos
        </Text>

        {!isImporting && (
          <>
            <TextInput
              label="URL de la propiedad"
              value={importUrl}
              onChangeText={setImportUrl}
              mode="outlined"
              style={styles.urlInput}
              placeholder="https://www.idealista.com/inmueble/..."
              multiline
            />

            <View style={styles.featuresContainer}>
              <Text variant="bodySmall" style={styles.featuresTitle}>
                Características del importador:
              </Text>
              <View style={styles.featuresList}>
                <Chip icon={() => <Globe size={14} color="white" />} 
                      style={[styles.featureChip, { backgroundColor: '#10b981' }]}
                      textStyle={{ color: 'white', fontSize: 12 }}>
                  Scraping directo
                </Chip>
                <Chip icon={() => <Database size={14} color="white" />} 
                      style={[styles.featureChip, { backgroundColor: '#f59e0b' }]}
                      textStyle={{ color: 'white', fontSize: 12 }}>
                  ScraperAPI fallback
                </Chip>
                {openaiApiKey && (
                  <Chip icon={() => <Brain size={14} color="white" />} 
                        style={[styles.featureChip, { backgroundColor: '#8b5cf6' }]}
                        textStyle={{ color: 'white', fontSize: 12 }}>
                    Procesamiento IA
                  </Chip>
                )}
              </View>
            </View>
          </>
        )}

        {isImporting && (
          <Card style={styles.progressCard}>
            <Card.Content>
              <View style={styles.progressHeader}>
                <Text variant="titleMedium">Importando propiedad...</Text>
                {progress && (
                  <Text variant="bodySmall" style={styles.progressText}>
                    {progress.message}
                  </Text>
                )}
              </View>

              {progress && (
                <ProgressBar 
                  progress={progress.progress / 100} 
                  style={styles.progressBar}
                  color="#2563eb"
                />
              )}

              {importResult?.metadata && (
                <View style={styles.metadataContainer}>
                  <View style={styles.metadataRow}>
                    {getMethodIcon(importResult.metadata.scrapingMethod)}
                    <Text variant="bodySmall" style={styles.metadataText}>
                      Método: {importResult.metadata.scrapingMethod}
                    </Text>
                  </View>
                  <View style={styles.metadataRow}>
                    {getMethodIcon(importResult.metadata.extractionMethod)}
                    <Text variant="bodySmall" style={styles.metadataText}>
                      Extracción: {importResult.metadata.extractionMethod}
                    </Text>
                  </View>
                  <Text variant="bodySmall" style={styles.metadataText}>
                    Contenido: {(importResult.metadata.contentLength / 1024).toFixed(1)}KB
                  </Text>
                </View>
              )}

              {importResult?.success && (
                <View style={styles.successContainer}>
                  <CheckCircle size={24} color="#10b981" />
                  <Text variant="bodyMedium" style={styles.successText}>
                    ¡Propiedad importada exitosamente!
                  </Text>
                </View>
              )}

              {importResult?.error && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={24} color="#ef4444" />
                  <Text variant="bodyMedium" style={styles.errorText}>
                    Error: {importResult.error}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {!isImporting && (
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={handleClose}
              style={styles.modalButton}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleImport}
              style={styles.modalButton}
              disabled={!importUrl.trim()}
            >
              Importar
            </Button>
          </View>
        )}

        {isImporting && !importResult?.success && (
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={handleClose}
              style={styles.modalButton}
            >
              Cancelar
            </Button>
          </View>
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
    padding: 20,
  },
  modalTitle: {
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalSubtitle: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  urlInput: {
    marginBottom: 20,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featuresTitle: {
    color: '#6b7280',
    marginBottom: 8,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    height: 28,
  },
  progressCard: {
    marginBottom: 20,
  },
  progressHeader: {
    marginBottom: 16,
  },
  progressText: {
    color: '#6b7280',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  metadataContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  metadataText: {
    color: '#6b7280',
    fontSize: 12,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  successText: {
    color: '#15803d',
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
  },
});
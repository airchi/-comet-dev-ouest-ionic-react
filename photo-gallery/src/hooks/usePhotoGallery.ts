import { useCamera } from '@capacitor-community/react-hooks/camera';
import {
  useFilesystem,
  base64FromPath,
} from '@capacitor-community/react-hooks/filesystem';
import { useStorage } from '@capacitor-community/react-hooks/storage';
import type { CameraPhoto } from '@capacitor/core';
import {
  CameraResultType,
  CameraSource,
  Capacitor,
  FilesystemDirectory,
} from '@capacitor/core';
import { isPlatform } from '@ionic/react';
import { useState, useEffect } from 'react';

export interface Photo {
  filepath: string;
  webviewPath?: string;
}
const PHOTO_STORAGE = 'photos';
export const usePhotoGallery = (): {
  photos: Photo[];
  takePhoto: () => Promise<void>;
} => {
  const { getPhoto } = useCamera();
  const { readFile, writeFile } = useFilesystem();
  const { get } = useStorage();
  const [photos, setPhotos] = useState<Photo[]>([]);

  const takePhoto = async () => {
    const cameraPhoto = await getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });
    const fileName = new Date().getTime() + '.jpeg';
    const savedFileImage = await savePicture(cameraPhoto, fileName);
    const newPhotos = [savedFileImage, ...photos];
    setPhotos(newPhotos);
  };

  const savePicture = async (
    photo: CameraPhoto,
    fileName: string,
  ): Promise<Photo> => {
    let base64Data: string;
    // "hybrid" will detect Cordova or Capacitor;
    if (isPlatform('hybrid')) {
      const file = await readFile({
        path: photo.path!,
      });
      base64Data = file.data;
    } else {
      base64Data = await base64FromPath(photo.webPath!);
    }
    const savedFile = await writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data,
    });

    if (isPlatform('hybrid')) {
      // Display the new image by rewriting the 'file://' path to HTTP
      // Details: https://ionicframework.com/docs/building/webview#file-protocol
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    } else {
      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: photo.webPath,
      };
    }
  };

  const loadSaved = async (): Promise<void> => {
    const photosString = await get('photos');
    const photosInStorage = (photosString
      ? JSON.parse(photosString)
      : []) as Photo[];
    // If running on the web...
    if (!isPlatform('hybrid')) {
      for (const photo of photosInStorage) {
        const file = await readFile({
          path: photo.filepath,
          directory: FilesystemDirectory.Data,
        });
        // Web platform only: Load photo as base64 data
        photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
      }
    }
    setPhotos(photosInStorage);
  };

  useEffect(() => {
    const loadSaved = async () => {
      const photosString = await get(PHOTO_STORAGE);
      const photos = (photosString ? JSON.parse(photosString) : []) as Photo[];
      for (const photo of photos) {
        const file = await readFile({
          path: photo.filepath,
          directory: FilesystemDirectory.Data,
        });
        photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
      }
      setPhotos(photos);
    };
    loadSaved();
  }, [get, readFile]);

  return {
    photos,
    takePhoto,
  };
};

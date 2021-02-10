import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonImg,
  IonPage,
  IonSlide,
  IonSlides,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import React, { useRef, useState } from 'react';

import { useCats } from '../hooks/useRequest';
import './Tab3.css';

const Tab3: React.FC = () => {
  const ref = useRef<HTMLIonSlidesElement>(null);
  const [nbCatLoad, setCatLoad] = useState<number>(0);
  const { isLoading, cats } = useCats();

  const getLength = async () => {
    if (ref.current !== null) {
      const length = await ref.current.length();
      console.log('length', length);
      if (length) {
        setCatLoad(length);
      }
      await ref.current.startAutoplay();
    }
  };

  const displayCats = () => {
    if (!isLoading) {
      return (
        <>
          <IonSlides ref={ref} onIonSlidesDidLoad={getLength}>
            {cats.map((cat: any) => {
              const { name, description, image } = cat;
              if (name && description && image) {
                return (
                  <IonSlide key={cat.id}>
                    <IonCard>
                      <IonCardHeader>
                        <IonCardTitle>{name}</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>
                        <IonImg src={image.url}></IonImg>
                        <IonText>{description}</IonText>
                      </IonCardContent>
                    </IonCard>
                  </IonSlide>
                );
              }
              return false;
            })}
          </IonSlides>
        </>
      );
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{`${nbCatLoad} Cats`}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Cats</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>{displayCats()}</IonContent>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;

import { CameraResultType, CameraSource } from '@capacitor/core';
import { useCamera } from '@ionic/react-hooks/camera';
import { Box, Button, Card, CardActions, CardMedia, CircularProgress, Grid, IconButton } from '@material-ui/core';
import { AddAPhoto, DeleteForever } from '@material-ui/icons';
import React from 'react';

export interface IPhoto {
  filepath: string;
  webviewPath?: string;
  base64?: string;
  dataUrl?: string;
}

export interface IPhotoContainerProps {
  classes?: any;
  photoState: { photos: IPhoto[]; setPhotos: (photo: IPhoto[]) => void };
}

const PhotoContainer: React.FC<IPhotoContainerProps> = (props) => {
  const { getPhoto } = useCamera();

  const takePhoto = async () => {
    const cameraPhoto = await getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 100
    });

    const fileName = new Date().getTime() + '.' + cameraPhoto.format;
    const photo = {
      filepath: fileName,
      dataUrl: cameraPhoto.dataUrl
    };

    props.photoState.setPhotos([...props.photoState.photos, photo]);
  };

  const deletePhotos = async () => {
    props.photoState.setPhotos([]);
  };

  const deletePhoto = async (filepath: any) => {
    const reducedPhotos = props.photoState.photos.filter((photo) => photo.filepath !== filepath);
    props.photoState.setPhotos(reducedPhotos);
  };

  if (!props.photoState) {
    return <CircularProgress />;
  }

  // Grid with overlays: https://material-ui.com/components/grid-list/
  return (
    <Box width={1}>
      <Box mb={3}>
        <Grid container>
          <Grid container item>
            {props.photoState.photos.map((photo, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card>
                  <CardMedia src={photo.dataUrl} component="img" />
                  <CardActions>
                    <IconButton onClick={() => deletePhoto(photo.filepath)}>
                      <DeleteForever />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Box>
      <Box>
        <Grid container>
          <Grid container item spacing={3} justify="center">
            <Grid item>
              <Button variant="contained" color="primary" startIcon={<AddAPhoto />} onClick={() => takePhoto()}>
                Add A Photo
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" startIcon={<DeleteForever />} onClick={() => deletePhotos()}>
                Remvoe All Photos
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default PhotoContainer;

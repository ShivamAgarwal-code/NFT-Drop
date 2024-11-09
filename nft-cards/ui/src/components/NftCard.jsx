import React from 'react';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';

import { images } from '../images';

const useStyles = makeStyles((theme) => {
  return {
    nftCard: {
      fontWeight: 'bold',
      position: 'relative',
      margin: theme.spacing(2),
      height: '360px',
      filter: 'blur(2px) grayscale(100%)',

      '&:hover': {
        filter: 'blur(0px) grayscale(0%)',
      },
    },
    media: {
      height: 0,
      paddingTop: '100%',
    },
    cardWrapper: {},
    cardText: {
      fontWeight: 'bold',
      fontSize: '24px',
      filter: 'blur(0)',
    },
  };
});

const NftCard = ({ nftName, handleClick }) => {
  const classes = useStyles();

  return (
    <Card className={classes.nftCard}>
      <CardActionArea onClick={() => handleClick(nftName)}>
        <CardMedia
          className={classes.media}
          image={images[nftName]}
          title={nftName}
        />
        <CardContent>
          <Typography
            gutterBottom
            variant="h5"
            component="h2"
            className={classes.cardText}
          >
            {nftName}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default NftCard;

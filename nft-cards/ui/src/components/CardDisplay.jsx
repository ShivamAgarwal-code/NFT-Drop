import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';

import NftCard from './NftCard.jsx';

const useStyles = makeStyles((theme) => {
  return {
    root: {
      marginTop: theme.spacing(2),
    },
    paper: {
      padding: theme.spacing(3),
      marginLeft: theme.spacing(2),
    },
  };
});

const CardDisplay = ({ nftNames, handleClick }) => {
  const classes = useStyles();

  const cards = nftNames.map((nftName) => (
    <Grid item sm={5} md={3} key={nftName}>
      <NftCard nftName={nftName} key={nftName} handleClick={handleClick} />
    </Grid>
  ));

  return (
    <Container>
      <Grid container className={classes.root}>
        <Grid item>
          <Paper className={classes.paper} elevation={0}>
            <Typography>
              Click on a card below to make an offer to buy the card.
            </Typography>
          </Paper>
        </Grid>
        <Grid
          container
          alignItems="stretch"
          direction="row"
          justify="space-evenly"
        >
          {cards}
        </Grid>
      </Grid>
    </Container>
  );
};

export default CardDisplay;

import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import Fab from '@material-ui/core/Fab';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import Zoom from '@material-ui/core/Zoom';

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'fixed',
        bottom: theme.spacing(2),
        right: theme.spacing(2),
    },
}));

export default function BackToTop(props) {
    const classes = useStyles();
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 200,
    });

    const handleClick = (event) => {
        const anchor =
            (event.target.ownerDocument || document)
                .querySelector('#upload-file-button');

        if (anchor) {
            anchor.scrollIntoView({behavior: 'smooth', block: 'center'});
        }
    };

    return (
        <Zoom in={trigger}>
            <div onClick={handleClick}
                 role="presentation"
                 className={classes.root}>
                <Fab color="primary"
                     size="small"
                     aria-label="scroll back to top">
                    <KeyboardArrowUpIcon/>
                </Fab>
            </div>
        </Zoom>
    );
}
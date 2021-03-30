import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Snackbar,
    TextField,
    Tooltip,
    withStyles
} from "@material-ui/core";
import {Close, Error, RemoveShoppingCart, ShoppingCart, Undo} from "@material-ui/icons";

const styles = theme => ({
    close: {
        padding: theme.spacing(0.5),
    },
});

class ProcessButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogOpen: false,
            emptyInput: false,
            input: '',
            snackBarOpen: false
        };

        this.id = `${props.itemId}-${props.type}-button`;
        this.dialogId = `${this.id}-confirm-dialog`;
        this.snackbarMsg = null;
        this.dialogMsg = null;
        this.buttonIcon = null;
        switch (props.type) {
            case 'purchase':
                this.snackbarMsg = 'You confirmed a purchase.';
                this.dialogMsg = 'Congratulations! Are you sure you want to redeem this wish?';
                this.buttonIcon = (<ShoppingCart/>);
                break;
            case 'reject':
                this.snackbarMsg = 'You confirmed a rejection.';
                this.dialogMsg = 'Enter the reason of rejection as a reminder for future consideration.';
                this.buttonIcon = (<RemoveShoppingCart/>);
                break;
            case 'putback':
                this.snackbarMsg = 'You put a processed item back to open list.';
                this.dialogMsg = 'Are you sure you want to put it back to open list?';
                this.buttonIcon = (<Undo/>);
                break;
            default:
                this.snackbarMsg = 'wrong button type';
                this.dialogMsg = 'wrong button type';
                this.buttonIcon = (<Error/>);
        }

        this.rejectReasonInputField = React.createRef();
        this.handleDialogOpen = this.handleDialogOpen.bind(this);
        this.handleDialogClose = this.handleDialogClose.bind(this);
        this.handleDialogConfirm = this.handleDialogConfirm.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSnackBarClose = this.handleSnackBarClose.bind(this);
    }

    handleDialogOpen() {
        this.setState({dialogOpen: true});
    };

    handleDialogClose() {
        this.setState({dialogOpen: false});
    };

    handleSnackBarClose() {
        this.setState({snackBarOpen: false});
    }

    handleInputChange(event) {
        this.setState({input: event.target.value});
    }

    handleDialogConfirm() {
        if (this.state.input) {
            this.setState({dialogOpen: false});
            this.props.onConfirm(this.state.input);
            this.setState({snackBarOpen: true});
        } else {
            this.setState({emptyInput: true});
            this.rejectReasonInputField.current.focus();
        }
    };


    render() {
        const state = this.state;
        const props = this.props;
        return (
            <>
                <Tooltip title={props.type}
                         arrow>
                    <IconButton id={this.id}
                                variant="text"
                                onClick={this.handleDialogOpen}
                                aria-label={this.id}
                                className={props.className}>
                        {this.buttonIcon}
                    </IconButton>
                </Tooltip>
                <Dialog open={state.dialogOpen}
                        onClose={this.handleDialogClose}
                        aria-labelledby={this.dialogId}>
                    <DialogTitle id={`${this.dialogId}-title`}>Confirm</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {this.dialogMsg}
                        </DialogContentText>
                        {(props.type === 'reject') &&
                        (<TextField
                            id={`${this.dialogId}-reason-of-rejection-input-field`}
                            autoFocus
                            margin="dense"
                            label="Reason of rejection"
                            required
                            type="text"
                            fullWidth
                            multiline
                            error={state.emptyInput}
                            helperText={state.emptyInput && "Reason should not be empty."}
                            ref={this.rejectReasonInputField}
                            onChange={this.handleInputChange}
                        />)}

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleDialogClose}>
                            Cancel
                        </Button>
                        <Button onClick={this.handleDialogConfirm}>
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
                <Snackbar
                    key={this.snackbarMsg}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={state.snackBarOpen}
                    autoHideDuration={6000}
                    onClose={this.handleSnackBarClose}
                    message={this.snackbarMsg}
                    action={
                        <React.Fragment>
                            <Button color="secondary" size="small" onClick={props.onUndo}>
                                UNDO
                            </Button>
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                className={props.classes.close}
                                onClick={this.handleSnackBarClose}
                            >
                                <Close/>
                            </IconButton>
                        </React.Fragment>
                    }
                />
            </>
        );
    }
}

export default withStyles(styles)(ProcessButton);
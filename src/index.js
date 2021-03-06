import React from 'react'
import ReactDOM from 'react-dom';
import FileComponent from './view/file'
import WishList from "./view/wishlist";
import {CssBaseline} from "@material-ui/core";
import Header from "./view/header";
import FileSaver from 'file-saver'
import Footer from "./view/footer";
import BackToTop from "./view/back-to-top-fab";
import Item from "./view/item-component-parts/Item";
import {ListName} from "./business/constants";
import CryptoJS from "crypto-js";

function mapFixInvalidItems(list = []) {
    const patch = {
        state: 'open',
        name: '',
        link: '',
        price: 0,
        createTime: new Date().toLocaleDateString('en-CA'),
        processTime: '',
        acceptNote: '',
        rejectNote: ''
    }
    const validState = new Set(['open', 'purchased', 'rejected']);

    return list.map(item => {
        if (item.name || item.acceptNote) {
            // use patch to set default value of a valid item
            let newItem = {...patch, ...item};
            if (!validState.has(newItem.state)) {
                newItem.state = 'open';
            }
            if (isNaN(newItem.price) || newItem.price < 0) {
                newItem.price = 0;
            }
            newItem.key = calculateMD5(newItem.name);
            return newItem;
        } else {
            return null;
        }
    }).filter(item => item); // filter for removing null value items
}

function calculateMD5(name) {
    const salt = Math.random().toString().slice(2, 10);
    return CryptoJS.MD5(name + salt).toString();
}

function mapRemoveItemKeys(list) {
    return list.map(element => {
        delete element.key;
        return element;
    });
}

function deleteItem(list = [], index) {
    return [...list.slice(0, index), ...list.slice(index + 1)];
}

function insertItem(list, index, item) {
    return [...list.slice(0, index), item, ...list.slice(index + 1)];
}


// TODO PWA未实现
// TODO 可以把字符串常量抽成常量类提高可读性吗？
export class App extends React.Component {
    constructor(props) {
        super(props);
        // Have to split wishlist to different lists,
        // for react component state updating convenience.
        const wishlist = props.fileContent.wishlist;
        this.state = {memory: []};
        Object.values(ListName).forEach(listName => (this.state[listName] = wishlist[listName]));

        this.handleUpload = this.handleUpload.bind(this);
        this.handleDownload = this.handleDownload.bind(this);
        this.handleItemChange = this.handleItemChange.bind(this);
        this.handleItemMove = this.handleItemMove.bind(this);
        this.handleUndoItemMove = this.handleUndoItemMove.bind(this);
    }

    // https://www.dropzonejs.com/
    handleUpload(content) {
        try {
            let fileContent = JSON.parse(content);
            if (!fileContent.wishlist) {
                console.error(
                    'file-parsing failed: can\'t find "wishlist" field in file.')
                return;
            }
            let uploadedWishlist = fileContent.wishlist;
            // fix invalid (incomplete fields, invalid values) items
            Object.keys(uploadedWishlist).forEach((key => {
                this.setState({
                    [key]: mapFixInvalidItems(uploadedWishlist[key])
                });
            }));
            console.log('file-parsing successful.');
        } catch (error) {
            console.error('file-parsing failed: ' + error);
        }
    }

    // https://www.npmjs.com/package/file-saver
    // use Blob type for transferring if possible, or use data:URI
    handleDownload() {
        // deep copy three item lists, mix them into one list object.
        let wishlist = {};
        Object.values(ListName).forEach(name => (wishlist[name] = this.state[name]));
        let copiedWishlist = JSON.parse(JSON.stringify(wishlist));
        // remove 'key' field in each item,
        // because it's randomly generated for React list sort,
        // it doesn't have reasonable information.
        Object.keys(copiedWishlist).forEach(key => {
            copiedWishlist[key] = mapRemoveItemKeys(copiedWishlist[key]);
        });

        const date = new Date();
        const timeString = [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds()].join('-');

        let file = new File(
            [JSON.stringify({wishlist: copiedWishlist})],
            `wishlist-dump-${timeString}.json`,
            {type: "application/json;charset=utf-8"});
        FileSaver.saveAs(file);
    }

    handleItemChange(src, index, field, newValue) {
        this.setState({
            [src]: this.state[src].map((item, _index) =>
                (_index === index) ? {...item, [field]: newValue} : item
            )
        });
    };

    handleItemMove(src, index, dst, rejectNote = '') {
        const srcList = this.state[src];
        const dstList = this.state[dst];
        const item = srcList[index];
        item.state = dst;
        item.rejectNote = rejectNote ? rejectNote : item.rejectNote;
        this.setState({
            [src]: deleteItem(srcList, index),
            [dst]: insertItem(dstList, 0, item),
            memory: this.state.memory.concat({
                src: dst,
                dst: src,
                dstIndex: index,
                itemKey: item.key
            })
        })
    }

    handleUndoItemMove() {
        const memory = this.state.memory;
        const {src, dst, dstIndex, itemKey} = memory[memory.length - 1];
        const srcList = this.state[src];
        const dstList = this.state[dst];
        const item = srcList.filter(item => item.key === itemKey);
        item.state = dst;
        const srcIndex = srcList.lastIndexOf(item);
        this.setState({
            [src]: deleteItem(srcList, srcIndex),
            [dst]: insertItem(dstList, dstIndex, item),
            memory: memory.slice(0, memory.length - 1)
        });
    }

    render() {
        return (<>
                <CssBaseline/>
                <Header/>
                <FileComponent onUpload={this.handleUpload}
                               onDownload={this.handleDownload}/>
                <WishList open={this.state.open}
                          purchased={this.state.purchased}
                          rejected={this.state.rejected}
                          onChange={this.handleItemChange}
                          onItemMove={this.handleItemMove}
                          onUndoItemMove={this.handleUndoItemMove}/>
                <BackToTop/>
                <Footer/>
            </>
        );
    }
}

// ========================================

const exampleFileContent = {
    wishlist: {
        open: [{
            "state": "open",
            "name": "Ocolos Quest2 VR",
            "link": "http://example.com",
            "acceptNote": "To play VR game.",
            "price": 2700,
            "createTime": "2021-03-10",
            "processTime": "",
            "rejectNote": "",
            "key": "bzff11597f876e9a0d42c54dd52ae228",
        }, {
            "state": "open",
            "name": "Death Integer",
            "link": "http://example.com",
            "acceptNote": "Want to play, but don't have a good enough GPU to run it.",
            "price": 350,
            "createTime": "2021-02-15",
            "processTime": "",
            "rejectNote": "",
            "key": "bbff11597f876e9a0d4gc54dd52ae227",
        }],
        purchased: [{
            "state": "purchased",
            "name": "Halikou EDC Bag + COMBOT3000 Molle Parts",
            "link": "http://example.com",
            "acceptNote": "Need a new bag for daily using.",
            "price": 550,
            "createTime": "2021-02-13",
            "processTime": "2021-02-27",
            "rejectNote": "",
            "key": "bbff11597f87k3s20d42c54dd52ae227",
        }],
        rejected: [{
            "state": "rejected",
            "name": "TechTeddyBear AirBorne ver",
            "link": "http://example.com",
            "acceptNote": "Just want one",
            "price": 100,
            "createTime": "2021-01-02",
            "processTime": "2021-01-27",
            "rejectNote": "Already got a marine ver.",
            "key": "bbff11597f876e9a0d42c54dd52ae227",
        }]
    }
};

ReactDOM.render(
    <App fileContent={exampleFileContent}/>,
    document.getElementById('root')
);

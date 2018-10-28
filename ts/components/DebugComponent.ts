import Component from '../engine/Component';
import GameObjectProxy from '../engine/GameObject';
import {MSG_OBJECT_ADDED, MSG_OBJECT_REMOVED, MSG_ALL,
    STATE_DRAWABLE, STATE_INACTIVE, STATE_LISTENING, STATE_UPDATABLE} from '../engine/Constants';
import { PIXICmp } from '../engine/PIXIObject';

/**
 * Debugging component that renders the whole scene graph
 */
export default class DebugComponent extends Component {
    targetHtmlElement : HTMLElement = null;
    strWrapper: any = null;

    constructor(displayBBox, targetHtmlElement) {
        super();
        this.targetHtmlElement = targetHtmlElement; // TODO add something more generic here
        this.strWrapper = {
            str: ""
        };
    }

    oninit() {

        // subscribe to all messages
        this.subscribe(MSG_ALL);
    }

    onmessage(msg) {
        let ownerTag = msg.gameObject != null ? msg.gameObject.tag : "";
        if (typeof (msg.action) == "string") {
            console.log(msg.action + " >> " + ownerTag);
        }
    }

    update(delta, absolute) {
        this.strWrapper.str = "";
        this.processNode(this.owner, this.strWrapper);
        this.targetHtmlElement.innerHTML = this.strWrapper.str;
    }


    protected setPadding(padding) {
        let otp = "";
        for (let i = 0; i < padding; i++) {
            otp = otp.concat("&nbsp");
        }
        return otp;
    }

    protected processNode(node: GameObjectProxy, strWrapper, padding = 0) {

        // transform:
        strWrapper.str += "<strong><span style=\"color:red\">";
        let bounds = node.pixiObject.toGlobal(node.pixiObject.position);
        strWrapper.str = strWrapper.str.concat(this.setPadding(padding + 2) +
            `rel:[${node.pixiObject.position.x.toFixed(2)},${node.pixiObject.position.y.toFixed(2)}]|abs:[${bounds.x.toFixed(2)},${bounds.y.toFixed(2)}]|rot: ${node.pixiObject.rotation.toFixed(2)}` +
            "<br>");
        strWrapper.str += "</span></strong>";

        // mesh
        strWrapper.str += "<strong><span style=\"color:purple\">";
        strWrapper.str = strWrapper.str.concat(this.setPadding(padding + 2) +
            `size:[${node.pixiObject.width.toFixed(2)} x ${node.pixiObject.height.toFixed(2)}]` +
            "<br>");
        strWrapper.str += "</span></strong>";

        // attributes
        for (let [key, attr] of node.attributes) {
            strWrapper.str += "<strong><span style=\"color:red\">";
            strWrapper.str = strWrapper.str.concat(this.setPadding(padding + 2) +
                `${key} => ${attr.toString()}` +
                "<br>");
            strWrapper.str += "</span></strong>";
        }

        // components
        for (let cmp of node.components) {
            strWrapper.str += "<span style=\"color:blue\">";
            strWrapper.str = strWrapper.str.concat(this.setPadding(padding + 2) + cmp.constructor.name + "<br>");
            strWrapper.str += "</span>";
        }

        // children
        for (let child of node.pixiObject.children) {
            let cmpChild = <PIXICmp.ComponentObject><any>child;

            strWrapper.str += "<span style=\"color:green\">";
            strWrapper.str = strWrapper.str.concat(this.setPadding(padding) +
                `${cmpChild.proxy.id}:${cmpChild.proxy.tag}` + "<br>");
            this.processNode(cmpChild.proxy, strWrapper, padding + 4);
            strWrapper.str += "</span>";
        }
    }
}
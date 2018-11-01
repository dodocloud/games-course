import Component from '../engine/Component';
import GameObjectProxy from '../engine/GameObjectProxy';
import { MSG_ANY } from '../engine/Constants';
import { PIXICmp } from '../engine/PIXIObject';
import Msg from '../engine/Msg';

/**
 * Debugging component that display a scene graph
 */
export default class DebugComponent extends Component {
    targetHtmlElement: HTMLElement = null;
    strWrapper: any = null;

    /**
     * Constructor
     * @param targetHtmlElement html element to which the debug info will be written (should be a div) 
     */
    constructor(targetHtmlElement: HTMLElement) {
        super();
        this.targetHtmlElement = targetHtmlElement;
        this.strWrapper = {
            str: ""
        };
    }

    onInit() {
        // subscribe to all messages
        this.subscribe(MSG_ANY);
    }

    onMessage(msg: Msg) {
        if (msg.gameObject != null) {
            console.log(msg.action + " >> " + msg.gameObject.getTag());
        }
    }

    onUpdate(delta, absolute) {
        this.strWrapper.str = "";
        this.processNode(this.owner.proxy, this.strWrapper);
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

        // position
        strWrapper.str += "<strong><span style=\"color:red\">";
        let bounds = node.pixiObj.toGlobal(new PIXI.Point(0, 0));
        strWrapper.str = strWrapper.str.concat(this.setPadding(padding + 2) +
            `rel:[${node.pixiObj.position.x.toFixed(2)},${node.pixiObj.position.y.toFixed(2)}]|abs:[${bounds.x.toFixed(2)},${bounds.y.toFixed(2)}]|rot: ${node.pixiObj.rotation.toFixed(2)}` +
            "<br>");
        strWrapper.str += "</span></strong>";

        // size
        strWrapper.str += "<strong><span style=\"color:purple\">";
        strWrapper.str = strWrapper.str.concat(this.setPadding(padding + 2) +
            `size:[${node.pixiObj.width.toFixed(2)} x ${node.pixiObj.height.toFixed(2)}]` +
            "<br>");
        strWrapper.str += "</span></strong>";

        // attributes
        for (let [key, attr] of node.attributes) {
            strWrapper.str += "<strong><span style=\"color:red\">";
            strWrapper.str = strWrapper.str.concat(this.setPadding(padding + 2) +
                `${key} => ${JSON.stringify(attr)}` +
                "<br>");
            strWrapper.str += "</span></strong>";
        }

        // components
        for (let [key, cmp] of node.components) {
            strWrapper.str += "<span style=\"color:blue\">";
            strWrapper.str = strWrapper.str.concat(this.setPadding(padding + 2) + cmp.constructor.name + "<br>");
            strWrapper.str += "</span>";
        }

        // children
        for (let child of node.pixiObj.children) {
            let cmpChild = <PIXICmp.ComponentObject><any>child;

            strWrapper.str += "<span style=\"color:green\">";
            strWrapper.str = strWrapper.str.concat(this.setPadding(padding) +
                `${cmpChild.proxy.id}:${cmpChild.proxy.tag}` + "<br>");
            this.processNode(cmpChild.proxy, strWrapper, padding + 4);
            strWrapper.str += "</span>";
        }
    }
}
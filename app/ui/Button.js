import FI_Node from '../../fiengine/node/FI_Node'
import FI_Text from '../../fiengine/component/FI_Text'
import FI_Touchable from '../../fiengine/component/FI_Touchable'
import { FI_ScaleTo } from '../../fiengine/action/FI_Scale'
export default class Button extends FI_Node{
  constructor(textContent){
    super()
    this.textContent = textContent
  }
  onAdded(){
    var inner = this.addChild(new FI_Node())
    var textNode = inner.addChild(new FI_Node())

    var textComponent = textNode.addComponent(new FI_Text())
    textComponent.content = this.textContent
    textComponent.onSizeChange = (t)=>{
      this.size.width = t.size.width
    }

    var touchableComponent = this.addComponent(new FI_Touchable())
    touchableComponent.onMouseIn = (t)=>{
      inner.removeAllActions()
      inner.addAction(new FI_ScaleTo(1.1,1.1,250))
    }
    touchableComponent.onMouseOut = (t)=>{
      inner.removeAllActions()
      inner.addAction(new FI_ScaleTo(1,1,250))
    }
    touchableComponent.onMouseDown = (t)=>{
      inner.removeAllActions()
      inner.addAction(new FI_ScaleTo(1,1,75))
    }
    touchableComponent.onMouseUp = (t)=>{
      inner.removeAllActions()
      inner.addAction(new FI_ScaleTo(1.1,1.1,75))
    }
  }
}

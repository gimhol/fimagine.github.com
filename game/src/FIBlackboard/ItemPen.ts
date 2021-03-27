import Item from './Item'
import ItemPenData from './ItemPenData'

export default class ItemPen extends Item {
    offscreenCanvas: HTMLCanvasElement
    offscreenCtx: CanvasRenderingContext2D
    prevMouseX:number
    prevMouseY:number
    coordIdx:number // 用于‘离屏绘制’时，遍历坐标点用。
    offscreenIntervalId: any // ‘离屏绘制’的定时器id。

    constructor(){
        super()
        this.offscreenCanvas = document.createElement('canvas')
        this.offscreenCanvas.width = 1000
        this.offscreenCanvas.height = 1000
        this.offscreenCtx = this.offscreenCanvas.getContext('2d')
    }
	selfData():ItemPenData{ 
        return <ItemPenData> this.data
    }
    toolMove(x:number,y:number){ 
        super.toolMove(x,y); 
    }
	toolDown(x:number,y:number){ 
        super.toolDown(x,y)
        this.selfData().coords.push(x) 
        this.selfData().coords.push(y)
        this._startOffscreen()
        this.prevMouseX = x;
        this.prevMouseY = y;
    }
	toolDraw(x:number,y:number){ 
        super.toolDraw(x,y)
        if( Math.abs(x - this.prevMouseX) + Math.abs(y - this.prevMouseY) < 3)
            return
        this.selfData().coords.push(x) 
        this.selfData().coords.push(y) 
        this.prevMouseX = x;
        this.prevMouseY = y;
    }
	toolDone(x:number,y:number){ 
        super.toolDone(x,y)
        this.selfData().coords.push(x) 
        this.selfData().coords.push(y)
        this.blackboard && this.blackboard.unsetEditingItem(this)
        this._endOffscreen()
    }

    /**
     * 判断一个O点是否位于AB线段中
     * @param ax A点的x坐标
     * @param ay A点的y坐标
     * @param bx B点的x坐标
     * @param by B点的y坐标
     * @param ox O点的x坐标
     * @param oy O点的x坐标
     * @returns 当O位于AB线段中，返回true，否则返回false
     */
    isTriDotsOneLine(ax:number, ay:number, bx:number, by:number, ox:number, oy:number){
        var diff = (ox - ax) * (by - ay) - (bx - ax) * (oy - ay)
        return diff == 0 && 
            Math.min(ax , bx) <= ox && ox <= Math.max(ax , bx) &&
            Math.min(ay , by) <= oy && oy <= Math.max(ay , by)
    }
    _startOffscreen(){
        this.offscreenCtx.strokeStyle = this.data.strokeColor
        this.offscreenCtx.lineWidth = this.data.lineWidth
        this.offscreenCtx.lineCap = this.data.lineCap
        this.offscreenCtx.lineJoin = this.data.lineJoin
        let x = this.selfData().coords[0]
        let y = this.selfData().coords[1]
        this.coordIdx = 2
        this.offscreenCtx.beginPath();
        this.offscreenCtx.moveTo(x,y)

        var halfLW = this.data.lineWidth / 2
        this.setX(x-halfLW)
        this.setY(y-halfLW)
        this.setW(this.data.lineWidth)
        this.setH(this.data.lineWidth)
        this.setDirty(true,x-halfLW,y-halfLW, x+halfLW, y+halfLW)
        this.update()
        
        this.offscreenIntervalId = setInterval(this._updateOffsceen.bind(this),60)
    }
    _updateOffsceen(){
        // console.log('dot count diff:',this.selfData().coords.length - this.coordIdx)
        while(this.coordIdx < this.selfData().coords.length - 2){
            this.offscreenCtx.clearRect(this.getX(),this.getY(),this.getW(),this.getH())
            let prevX = this.selfData().coords[this.coordIdx-2];
            let prevY = this.selfData().coords[this.coordIdx-1];
            let x = this.selfData().coords[this.coordIdx];
            let y = this.selfData().coords[this.coordIdx+1];
            this.coordIdx += 2
            if(this.coordIdx < this.selfData().coords.length - 2){
                let nextX = this.selfData().coords[this.coordIdx];
                let nextY = this.selfData().coords[this.coordIdx+1];
                if(this.isTriDotsOneLine(prevX,prevY,nextX,nextY,x,y)){ // 忽略构成直线的点。
                    // console.log('isTriDotsOneLine: ',prevX,prevY,x,y,nextX,nextY)
                    continue
                }
            }
            let dx = (x+prevX)/2
            let dy = (y+prevY)/2
            let cx1 = prevX
            let cy1 = prevY
            let cx2 = prevX
            let cy2 = prevY
            this.offscreenCtx.bezierCurveTo(cx1,cy1,cx2,cy2,dx,dy)
            this.offscreenCtx.stroke();
            
            var halfLW = this.data.lineWidth / 2
            this.setLeft(Math.min(x - halfLW,this.getLeft()))
            this.setTop(Math.min(y - halfLW,this.getTop()))
            this.setRight(Math.max(x + halfLW, this.getRight()))
            this.setBottom(Math.max(y + halfLW, this.getBottom()))
            this.setDirty(true,
                Math.min(prevX,x)-halfLW,
                Math.min(prevY,y)-halfLW,
                Math.max(prevX,x)+halfLW,
                Math.max(prevY,y)+halfLW)
        }
        this.update()
    }
    _endOffscreen(){
        clearInterval(this.offscreenIntervalId)
        this._updateOffsceen();

        let prevX = this.selfData().coords[this.coordIdx-2];
        let prevY = this.selfData().coords[this.coordIdx-1];
        let x = this.selfData().coords[this.coordIdx];
        let y = this.selfData().coords[this.coordIdx+1];

        this.offscreenCtx.lineTo(x,y)
        this.offscreenCtx.stroke();

        var halfLW = this.data.lineWidth / 2
        this.setDirty(true,
            Math.min(prevX,x)-halfLW,
            Math.min(prevY,y)-halfLW,
            Math.max(prevX,x)+halfLW,
            Math.max(prevY,y)+halfLW)
        this.update()
    }

	paint(ctx:CanvasRenderingContext2D,left:number = 0, top:number = 0, right:number = 0, bottom:number = 0){
        ctx.drawImage(this.offscreenCanvas,
            left, top, right-left, bottom-top,
            left, top, right-left, bottom-top)
        super.paint(ctx,left,top,right,bottom)
    }
}
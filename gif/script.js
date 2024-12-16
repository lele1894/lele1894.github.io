class GIFEditor {
    constructor() {
        this.initializeVariables();
        this.setupEventListeners();
        this.loadSystemFonts();
    }

    initializeVariables() {
        // DOM元素
        this.canvas = document.getElementById('previewCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.dropZone = document.getElementById('dropZone');
        
        // GIF相关变量
        this.frames = [];
        this.currentFrame = 0;
        this.totalFrames = 0;
        this.isPlaying = true;
        this.animationDelay = 100;
        
        // 文字相关变量
        this.text = '';
        this.textPosition = { x: 10, y: 10 };
        this.fontSize = 20;
        this.textColor = '#FFFFFF';
        this.strokeColor = '#000000';
        this.strokeWidth = 0;
        this.textScale = 1.0;
        this.textStartFrame = 0;
        this.textEndFrame = 999999;
        
        // 覆盖图片相关变量
        this.overlayImage = null;
        this.overlayPosition = { x: 10, y: 10 };
        this.overlayScale = 1.0;
        this.overlayStartFrame = 0;
        this.overlayEndFrame = 999999;
        
        // 拖拽相关变量
        this.isDraggingText = false;
        this.isDraggingOverlay = false;
        this.dragStartPos = { x: 0, y: 0 };
    }

    setupEventListeners() {
        // 文件拖放
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files[0];
            if (file.type === 'image/gif') {
                this.loadGIF(file);
            } else {
                this.showMessage('请拖入GIF格式的文件!', true);
            }
        });

        // 播放控制
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            this.togglePlay();
        });

        // 进度条控制
        document.getElementById('progressBar').addEventListener('input', (e) => {
            this.currentFrame = Math.floor((e.target.value / 100) * (this.totalFrames - 1));
            this.updateFrameInfo();
            this.renderFrame();
        });

        // 文字输入
        document.getElementById('textInput').addEventListener('input', (e) => {
            this.text = e.target.value;
            this.renderFrame();
        });

        // 文字缩放
        document.getElementById('textScaleSlider').addEventListener('input', (e) => {
            this.textScale = e.target.value / 100;
            document.getElementById('textScaleValue').textContent = `${e.target.value}%`;
            this.renderFrame();
        });

        // 导入按钮点击事件
        document.getElementById('importBtn').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/gif';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.loadGIF(file);
                }
            };
            input.click();
        });

        // 修改拖放区域的事件处理
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropZone.style.background = 'rgba(0,0,0,0.8)';
        });

        this.canvas.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropZone.style.background = 'rgba(0,0,0,0.7)';
        });

        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'image/gif') {
                this.loadGIF(file);
            } else {
                this.showMessage('请拖入GIF格式的文件!', true);
            }
        });

        // 文字颜色控制
        document.getElementById('textColor').addEventListener('input', (e) => {
            this.textColor = e.target.value;
            this.renderFrame();
        });

        // 描边颜色控制
        document.getElementById('strokeColor').addEventListener('input', (e) => {
            this.strokeColor = e.target.value;
            this.renderFrame();
        });

        // 描边宽度控制
        document.getElementById('strokeWidth').addEventListener('input', (e) => {
            this.strokeWidth = parseInt(e.target.value);
            this.renderFrame();
        });

        // 字体大小控制
        document.getElementById('fontSize').addEventListener('input', (e) => {
            this.fontSize = parseInt(e.target.value);
            this.renderFrame();
        });

        // 文字拖动相关事件
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 检查是否点击到文字区域
            if (this.text) {
                const ctx = this.canvas.getContext('2d');
                const fontSize = this.fontSize * this.textScale;
                ctx.font = `${fontSize}px ${document.getElementById('fontSelect').value}`;
                const metrics = ctx.measureText(this.text);
                const textWidth = metrics.width;
                const textHeight = fontSize;

                if (x >= this.textPosition.x && x <= this.textPosition.x + textWidth &&
                    y >= this.textPosition.y - textHeight && y <= this.textPosition.y) {
                    this.isDraggingText = true;
                    this.dragStartPos = {
                        x: x - this.textPosition.x,
                        y: y - this.textPosition.y
                    };
                }
            }
            
            // 检查是否点击到覆盖图片区域
            if (this.overlayImage) {
                const width = this.overlayImage.width * this.overlayScale;
                const height = this.overlayImage.height * this.overlayScale;
                
                if (x >= this.overlayPosition.x && x <= this.overlayPosition.x + width &&
                    y >= this.overlayPosition.y && y <= this.overlayPosition.y + height) {
                    this.isDraggingOverlay = true;
                    this.dragStartPos = {
                        x: x - this.overlayPosition.x,
                        y: y - this.overlayPosition.y
                    };
                }
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDraggingText || this.isDraggingOverlay) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                if (this.isDraggingText) {
                    this.textPosition = {
                        x: x - this.dragStartPos.x,
                        y: y - this.dragStartPos.y
                    };
                } else if (this.isDraggingOverlay) {
                    this.overlayPosition = {
                        x: x - this.dragStartPos.x,
                        y: y - this.dragStartPos.y
                    };
                }
                
                this.renderFrame();
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isDraggingText = false;
            this.isDraggingOverlay = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isDraggingText = false;
            this.isDraggingOverlay = false;
        });

        // 覆盖图片选择
        document.getElementById('selectOverlayBtn').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.loadOverlayImage(file);
                }
            };
            input.click();
        });

        // 清除覆盖图片
        document.getElementById('clearOverlayBtn').addEventListener('click', () => {
            this.overlayImage = null;
            this.renderFrame();
            this.showMessage('已清除覆盖图片');
        });

        // 覆盖图片缩放
        document.getElementById('overlayScaleSlider').addEventListener('input', (e) => {
            this.overlayScale = e.target.value / 100;
            document.getElementById('overlayScaleValue').textContent = `${e.target.value}%`;
            this.renderFrame();
        });

        // 保存按钮点击事件
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveGIF();
        });

        // 文字显示时间控制
        document.getElementById('textStartFrame').addEventListener('input', (e) => {
            this.textStartFrame = parseInt(e.target.value) || 0;
            if (this.textStartFrame < 0) this.textStartFrame = 0;
            if (this.textStartFrame >= this.totalFrames) {
                this.textStartFrame = this.totalFrames - 1;
            }
            this.renderFrame();
        });

        document.getElementById('textEndFrame').addEventListener('input', (e) => {
            this.textEndFrame = parseInt(e.target.value) || this.totalFrames - 1;
            if (this.textEndFrame >= this.totalFrames) {
                this.textEndFrame = this.totalFrames - 1;
            }
            if (this.textEndFrame < this.textStartFrame) {
                this.textEndFrame = this.textStartFrame;
            }
            this.renderFrame();
        });

        // 覆盖图片显示时间控制
        document.getElementById('overlayStartFrame').addEventListener('input', (e) => {
            this.overlayStartFrame = parseInt(e.target.value) || 0;
            if (this.overlayStartFrame < 0) this.overlayStartFrame = 0;
            if (this.overlayStartFrame >= this.totalFrames) {
                this.overlayStartFrame = this.totalFrames - 1;
            }
            this.renderFrame();
        });

        document.getElementById('overlayEndFrame').addEventListener('input', (e) => {
            this.overlayEndFrame = parseInt(e.target.value) || this.totalFrames - 1;
            if (this.overlayEndFrame >= this.totalFrames) {
                this.overlayEndFrame = this.totalFrames - 1;
            }
            if (this.overlayEndFrame < this.overlayStartFrame) {
                this.overlayEndFrame = this.overlayStartFrame;
            }
            this.renderFrame();
        });

        // 其他控制事件监听器...
    }

    loadSystemFonts() {
        const fontSelect = document.getElementById('fontSelect');
        const defaultFonts = [
            '微软雅黑',
            '宋体',
            '黑体',
            '楷体',
            '仿宋'
        ];

        defaultFonts.forEach(font => {
            const option = document.createElement('option');
            option.value = font;
            option.textContent = font;
            fontSelect.appendChild(option);
        });
    }

    async loadGIF(file) {
        try {
            // 读取文件数据
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            
            // 创建GIF解码器
            const gr = new GifReader(uint8Array);
            
            // 设置画布尺寸
            this.canvas.width = gr.width;
            this.canvas.height = gr.height;
            
            // 获取所有帧
            this.frames = [];
            this.totalFrames = gr.numFrames();
            
            // 更新显示时间输入框的最大值
            document.getElementById('textStartFrame').max = this.totalFrames - 1;
            document.getElementById('textEndFrame').max = this.totalFrames - 1;
            document.getElementById('overlayStartFrame').max = this.totalFrames - 1;
            document.getElementById('overlayEndFrame').max = this.totalFrames - 1;
            
            // 设置结束帧的默认值为最后一帧
            document.getElementById('textEndFrame').value = this.totalFrames - 1;
            document.getElementById('overlayEndFrame').value = this.totalFrames - 1;
            this.textEndFrame = this.totalFrames - 1;
            this.overlayEndFrame = this.totalFrames - 1;
            
            // 创建临时canvas用于解码
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = gr.width;
            tempCanvas.height = gr.height;
            const tempCtx = tempCanvas.getContext('2d');
            const imageData = tempCtx.createImageData(gr.width, gr.height);
            
            // 解码每一帧
            for (let i = 0; i < this.totalFrames; i++) {
                // 解码帧数据
                gr.decodeAndBlitFrameRGBA(i, imageData.data);
                tempCtx.putImageData(imageData, 0, 0);
                
                // 创建新的canvas存储当前帧
                const frameCanvas = document.createElement('canvas');
                frameCanvas.width = gr.width;
                frameCanvas.height = gr.height;
                const ctx = frameCanvas.getContext('2d');
                ctx.drawImage(tempCanvas, 0, 0);
                
                this.frames.push(frameCanvas);
            }
            
            this.currentFrame = 0;
            this.animationDelay = gr.frameInfo(0).delay * 10; // 转换为毫秒
            this.dropZone.classList.add('hide');
            this.showMessage('GIF加载成功!');
            this.startAnimation();
            
        } catch (error) {
            this.showMessage('GIF加载失败: ' + error.message, true);
            console.error(error);
        }
    }

    renderFrame() {
        if (!this.frames.length) return;

        const frame = this.frames[this.currentFrame];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制当前帧
        this.ctx.drawImage(frame, 0, 0);

        // 绘制文字（检查是否在显示时间范围内）
        if (this.text && 
            this.currentFrame >= this.textStartFrame && 
            this.currentFrame <= this.textEndFrame) {
            this.drawText();
        }

        // 绘制覆盖图片（检查是否在显示时间范围内）
        if (this.overlayImage && 
            this.currentFrame >= this.overlayStartFrame && 
            this.currentFrame <= this.overlayEndFrame) {
            this.drawOverlay();
        }
    }

    drawText() {
        if (!this.text) return;
        
        this.ctx.save();
        
        // 设置文字样式
        const fontSize = this.fontSize * this.textScale;
        this.ctx.font = `${fontSize}px ${document.getElementById('fontSelect').value}`;
        
        // 绘制描边
        if (this.strokeWidth > 0) {
            this.ctx.strokeStyle = this.strokeColor;
            this.ctx.lineWidth = this.strokeWidth;
            this.ctx.strokeText(this.text, this.textPosition.x, this.textPosition.y);
        }
        
        // 绘制文字
        this.ctx.fillStyle = this.textColor;
        this.ctx.fillText(this.text, this.textPosition.x, this.textPosition.y);
        
        this.ctx.restore();
    }

    drawOverlay() {
        if (!this.overlayImage) return;
        
        // 如果是GIF，使用当前帧
        const currentOverlay = this.overlayFrames ? 
            this.overlayFrames[this.currentFrame % this.overlayTotalFrames] : 
            this.overlayImage;
        
        const width = currentOverlay.width * this.overlayScale;
        const height = currentOverlay.height * this.overlayScale;
        
        this.ctx.drawImage(
            currentOverlay,
            this.overlayPosition.x,
            this.overlayPosition.y,
            width,
            height
        );
    }

    startAnimation() {
        if (!this.isPlaying) return;
        
        this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
        this.updateFrameInfo();
        this.renderFrame();
        
        setTimeout(() => {
            requestAnimationFrame(() => this.startAnimation());
        }, this.animationDelay);
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        document.getElementById('playPauseBtn').textContent = 
            this.isPlaying ? '暂停' : '播放';
        
        if (this.isPlaying) {
            this.startAnimation();
        }
    }

    updateFrameInfo() {
        document.getElementById('frameInfo').textContent = 
            `${this.currentFrame + 1}/${this.totalFrames}`;
        document.getElementById('progressBar').value = 
            (this.currentFrame / (this.totalFrames - 1)) * 100;
    }

    showMessage(message, isError = false) {
        const messageList = document.getElementById('messageList');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isError ? 'error' : 'success'}`;
        messageElement.textContent = message;
        
        messageList.insertBefore(messageElement, messageList.firstChild);
        
        // 保持最多5条消息
        while (messageList.children.length > 5) {
            messageList.removeChild(messageList.lastChild);
        }
        
        // 3秒后自动删除消息
        setTimeout(() => {
            messageElement.remove();
        }, 10000);
    }

    // 添加加载覆盖图片的方法
    async loadOverlayImage(file) {
        try {
            if (file.type === 'image/gif') {
                // 如果是GIF，使用相同的GIF解析方法
                const arrayBuffer = await file.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                const gr = new GifReader(uint8Array);
                
                // 创建帧数组
                this.overlayFrames = [];
                this.overlayTotalFrames = gr.numFrames();
                
                // 创建临时canvas
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = gr.width;
                tempCanvas.height = gr.height;
                const tempCtx = tempCanvas.getContext('2d');
                const imageData = tempCtx.createImageData(gr.width, gr.height);
                
                // 解码每一帧
                for (let i = 0; i < this.overlayTotalFrames; i++) {
                    gr.decodeAndBlitFrameRGBA(i, imageData.data);
                    tempCtx.putImageData(imageData, 0, 0);
                    
                    const frameCanvas = document.createElement('canvas');
                    frameCanvas.width = gr.width;
                    frameCanvas.height = gr.height;
                    const ctx = frameCanvas.getContext('2d');
                    ctx.drawImage(tempCanvas, 0, 0);
                    
                    this.overlayFrames.push(frameCanvas);
                }
                
                this.overlayImage = this.overlayFrames[0];
            } else {
                // 静态图片处理
                const url = URL.createObjectURL(file);
                const img = new Image();
                
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = url;
                });
                
                this.overlayImage = img;
                this.overlayFrames = null;
                URL.revokeObjectURL(url);
            }
            
            this.overlayPosition = { x: 10, y: 10 };
            this.renderFrame();
            this.showMessage('覆盖图片加载成功!');
        } catch (error) {
            this.showMessage('覆盖图片加载失败: ' + error.message, true);
        }
    }

    // 添加保存方法
    async saveGIF() {
        try {
            // 显示保存对话框
            const filename = await this.showSaveDialog();
            if (!filename) return; // 用户取消了保存

            // 显示进度条
            const overlay = document.querySelector('.progress-overlay');
            const progressFill = document.querySelector('.progress-fill');
            const progressText = document.querySelector('.progress-text');
            overlay.style.display = 'flex';

            // 创建新的GIF编码器
            const encoder = new GIFEncoder();
            encoder.setRepeat(0);  // 0表示无限循环
            encoder.setDelay(this.animationDelay);  // 设置帧延迟
            encoder.setQuality(20); // 降低质量以提高速度
            encoder.start();

            // 创建临时canvas
            const tempCanvas = document.createElement('canvas');
            // 缩小尺寸以提高性能
            const scale = 1.0; // 可以调整这个值来改变输出质量，比如0.8表示80%的尺寸
            tempCanvas.width = this.canvas.width * scale;
            tempCanvas.height = this.canvas.height * scale;
            const ctx = tempCanvas.getContext('2d');

            // 分批处理帧
            const batchSize = 10; // 增加每批处理的帧数
            for (let i = 0; i < this.totalFrames; i += batchSize) {
                const end = Math.min(i + batchSize, this.totalFrames);
                
                for (let j = i; j < end; j++) {
                    // 清空画布
                    ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                    
                    // 绘制原始帧（缩放）
                    ctx.drawImage(this.frames[j], 0, 0, tempCanvas.width, tempCanvas.height);
                    
                    // 绘制文字
                    if (this.text && j >= this.textStartFrame && j <= this.textEndFrame) {
                        const fontSize = (this.fontSize * this.textScale) * scale;
                        ctx.font = `${fontSize}px ${document.getElementById('fontSelect').value}`;
                        
                        if (this.strokeWidth > 0) {
                            ctx.strokeStyle = this.strokeColor;
                            ctx.lineWidth = this.strokeWidth * scale;
                            ctx.strokeText(this.text, this.textPosition.x * scale, this.textPosition.y * scale);
                        }
                        
                        ctx.fillStyle = this.textColor;
                        ctx.fillText(this.text, this.textPosition.x * scale, this.textPosition.y * scale);
                    }
                    
                    // 绘制覆盖图片
                    if (this.overlayImage && j >= this.overlayStartFrame && j <= this.overlayEndFrame) {
                        const currentOverlay = this.overlayFrames ? 
                            this.overlayFrames[j % this.overlayTotalFrames] : 
                            this.overlayImage;
                        
                        const width = currentOverlay.width * this.overlayScale * scale;
                        const height = currentOverlay.height * this.overlayScale * scale;
                        
                        ctx.drawImage(
                            currentOverlay,
                            this.overlayPosition.x * scale,
                            this.overlayPosition.y * scale,
                            width,
                            height
                        );
                    }
                    
                    // 添加帧到GIF
                    encoder.addFrame(ctx);
                    
                    // 更新进度
                    const percent = Math.round((j + 1) * 100 / this.totalFrames);
                    progressFill.style.width = `${percent}%`;
                    progressText.textContent = `添加帧: ${j + 1}/${this.totalFrames}`;
                }
                
                // 减少每批之间的延迟
                await new Promise(resolve => setTimeout(resolve, 5));
            }
            
            // 完成GIF编码
            encoder.finish();
            
            // 完成GIF编码后保存
            const binary_gif = encoder.stream().getData();
            const byteArray = new Uint8Array(binary_gif.length);
            for (let i = 0; i < binary_gif.length; i++) {
                byteArray[i] = binary_gif.charCodeAt(i);
            }
            
            const blob = new Blob([byteArray], {type: 'image/gif'});

            // 使用系统保存对话框
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            
            // 触发系统保存对话框
            link.click();
            
            // 清理
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            overlay.style.display = 'none';
            this.showMessage('GIF保存成功!');
            
        } catch (error) {
            document.querySelector('.progress-overlay').style.display = 'none';
            this.showMessage('GIF保存失败: ' + error.message, true);
            console.error(error);
        }
    }

    // 添加保存对话框方法
    async showSaveDialog() {
        // 创建对话框HTML
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
        `;
        
        dialog.innerHTML = `
            <h3 style="margin-bottom: 15px;">保存GIF</h3>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px;">文件名:</label>
                <input type="text" id="saveFilename" value="output.gif" 
                    style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button id="cancelSave" style="padding: 5px 15px; border: none; border-radius: 4px; cursor: pointer;">取消</button>
                <button id="confirmSave" style="padding: 5px 15px; border: none; border-radius: 4px; background: #4CAF50; color: white; cursor: pointer;">保存</button>
            </div>
        `;

        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(dialog);

        // 返回Promise以等待用户操作
        return new Promise((resolve) => {
            const input = dialog.querySelector('#saveFilename');
            const cancelBtn = dialog.querySelector('#cancelSave');
            const confirmBtn = dialog.querySelector('#confirmSave');

            // 取消保存
            cancelBtn.onclick = () => {
                document.body.removeChild(dialog);
                document.body.removeChild(overlay);
                resolve(null);
            };

            // 确认保存
            confirmBtn.onclick = () => {
                let filename = input.value.trim();
                if (!filename) filename = 'output.gif';
                if (!filename.toLowerCase().endsWith('.gif')) {
                    filename += '.gif';
                }
                document.body.removeChild(dialog);
                document.body.removeChild(overlay);
                resolve(filename);
            };

            // 按Enter键确认
            input.onkeyup = (e) => {
                if (e.key === 'Enter') {
                    confirmBtn.click();
                }
            };
        });
    }
}

// 初始化应用
window.addEventListener('DOMContentLoaded', () => {
    new GIFEditor();
}); 
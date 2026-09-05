from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'output/pdf/bilhetes-bistro10-a4.pdf'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
c = canvas.Canvas(str(OUTPUT), pagesize=A4)
c.setTitle('Bistrô Hamburgueria | Bilhetes BISTRO10')
W, H = A4
for row in range(4):
    for col in range(2):
        x, y = (10 + col * 97) * mm, H - (10 + (row + 1) * 69) * mm
        w, h = 93 * mm, 65 * mm
        c.setStrokeColor(HexColor('#bcbcbc')); c.setDash(2, 3)
        c.rect(x, y, w, h); c.setDash()
        c.setFillColor(HexColor('#b82b21')); c.rect(x+3*mm,y+h-5*mm,12*mm,1.2*mm,fill=1,stroke=0)
        def text(tx, ty, value, size=10, bold=False, color='#241c17'):
            c.setFillColor(HexColor(color)); c.setFont('Helvetica-Bold' if bold else 'Helvetica',size)
            c.drawString(x+tx*mm,y+ty*mm,value)
        text(4,53,'BISTRÔ HAMBURGUERIA',10,True)
        text(4,45,'Gostou? Peça direto',14,True)
        text(4,39,'na próxima!',14,True)
        text(4,26,'10% OFF',25,True,'#b82b21')
        text(4,20,'NO NOSSO APP',9,True)
        text(4,13,'Use o cupom BISTRO10',11,True)
        code = qr.QrCodeWidget('https://bistrohamburgueria.com.br/')
        a,b,cc,d = code.getBounds(); size = 25*mm
        drawing = Drawing(size,size,transform=[size/(cc-a),0,0,size/(d-b),0,0]); drawing.add(code)
        renderPDF.draw(drawing,c,x+65*mm,y+14*mm)
        text(4,7.5,'bistrohamburgueria.com.br',9)
        text(4,3.5,'10% nos produtos. Entrega à parte. Um cupom por pedido.',6.6)
c.save()
print(OUTPUT)

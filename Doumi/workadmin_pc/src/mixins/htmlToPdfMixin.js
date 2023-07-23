import html2Canvas from 'html2canvas';
import JsPDF from 'jspdf';

export const htmlToPdfMixin = {
  data() {
    return {}
  },
  created() {
  },
  mounted() {
  },
  methods: {
    //将特定部分转成pdf并下载
    getPdf (rowTitle) {
      let title = this.titleName || rowTitle;
      html2Canvas(document.querySelector('#violationDom'), {
        allowTaint: true,
        dpi: 144
      }).then(function (canvas) {
        let contentWidth = canvas.width
        let contentHeight = canvas.height
        let pageHeight = contentWidth / 592.28 * 841.89
        let leftHeight = contentHeight
        let position = 0
        let imgWidth = 595.28
        let imgHeight = 592.28 / contentWidth * contentHeight
        let pageData = canvas.toDataURL('image/jpeg', 1.0)
        let PDF = new JsPDF('', 'pt', 'a4')
        if (leftHeight < pageHeight) {
          PDF.addImage(pageData, 'JPEG', 1, 1, imgWidth, imgHeight)
        } else {
          while (leftHeight > 0) {
            PDF.addImage(pageData, 'JPEG', 1, position, imgWidth, imgHeight)
            leftHeight -= pageHeight
            position -= 841.89
            if (leftHeight > 0) {
              PDF.addPage()
            }
          }
        }
        PDF.save(title + '.pdf')
      }
      )
    },
  }
}
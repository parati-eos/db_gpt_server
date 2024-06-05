function cleanAndSplit(text) {
    const cleanedText = text.replace(/[\n:;]+/g, ' ').trim();
    const pointsArray = cleanedText.split(/(?=\d+\.\s)/).map(point => {
      return point.replace(/^\d+\.\s*/, '').trim().replace(/^-\s*/, '');
    });
  
    return pointsArray;
  }
  
module.exports = cleanAndSplit
  
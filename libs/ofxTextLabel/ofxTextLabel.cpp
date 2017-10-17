//
//  ofxTextLabel.cpp
//  ofxTextLabel
//
//  Created by Elie Zananiri on 2014-07-10.
//
//

#include "ofxTextLabel.h"

//--------------------------------------------------------------
template<typename T>
void ofxTextLabel_<T>::stringToLines(T& font, const string& str, float lineLength, vector<string>& textLines, ofRectangle& textBounds, float lineSpacing)
{
    textLines.clear();
    
    vector<string> lines = ofSplitString(str, "\n", true, true);
    for (int i = 0; i < lines.size(); i++) {
        vector<string> words = ofSplitString(lines[i], " ", true, true);
        
        if (words.empty()) continue;
        
        string currLine = "";
        int w = 0;
        while (w < words.size()) {
            if (currLine.empty()) {
                // Add a first word to the line, regardless of length.
                currLine = words[w];
                w++;
            }
            else if (font.stringWidth(currLine + " " + words[w]) < lineLength) {
                // It fits, add another word to the line.
                currLine += " " + words[w];
                w++;
            }
            else {
                // It doesn't fit, add a new line and try again.
                textLines.push_back(currLine);
                currLine = "";
            }
        }
        
        // Add the last computed line.
        textLines.push_back(currLine);
    }
    
    // Calculate the bounds.
    textBounds.width = 0;
    if (textLines.empty()) {
        textBounds.height = 0;
    }
    else {
        textBounds.height = font.getLineHeight() * lineSpacing * (textLines.size() - 1);
        for (int i = 0; i < textLines.size(); i++) {
            textBounds.width = MAX(textBounds.width, font.stringWidth(textLines[i]));
            if (i == textLines.size() - 1) {
                textBounds.height += font.stringHeight(textLines[i]);
            }
        }
    }
}

//--------------------------------------------------------------
template<typename T>
void ofxTextLabel_<T>::drawLines(T& font, vector<string>& textLines, ofRectangle& textBounds, const ofRectangle& drawBounds, float lineSpacing, ofAlignHorz alignHorz, ofAlignVert alignVert)
{
    if (alignHorz == OF_ALIGN_HORZ_LEFT) {
        textBounds.x = drawBounds.x;
    }
    else if (alignHorz == OF_ALIGN_HORZ_CENTER) {
        textBounds.x = drawBounds.x + (drawBounds.width - textBounds.width) / 2.0f;
    }
    else if (alignHorz == OF_ALIGN_HORZ_RIGHT) {
        textBounds.x = drawBounds.x + drawBounds.width - textBounds.width;
    }
    
    if (alignVert == OF_ALIGN_VERT_TOP) {
        textBounds.y = drawBounds.y;
    }
    else if (alignVert == OF_ALIGN_VERT_CENTER) {
        textBounds.y = drawBounds.y + (drawBounds.height - textBounds.height) / 2.0f;
    }
    else if (alignVert == OF_ALIGN_VERT_BOTTOM) {
        textBounds.y = drawBounds.y + drawBounds.height - textBounds.height;
    }
    
    float lineX, lineY;
    ofRectangle lineBounds;
    lineY = textBounds.y;
    for (int i = 0; i < textLines.size(); i++) {
        lineBounds = font.getStringBoundingBox(textLines[i], 0, 0);
        if (alignHorz == OF_ALIGN_HORZ_LEFT || alignHorz == OF_ALIGN_HORZ_IGNORE) {
            lineX = textBounds.x;
        }
        else if (alignHorz == OF_ALIGN_HORZ_CENTER) {
            lineX = textBounds.x + (textBounds.width - lineBounds.width) / 2.0f;
        }
        else {  // (alignHorz == OF_ALIGN_HORZ_RIGHT)
            lineX = textBounds.x + textBounds.width - lineBounds.width;
        }
        if (i == 0) {
            lineY += font.stringHeight("Ad");  // Easiest way to get ascender height.
        }
        else {
            lineY += font.getLineHeight() * lineSpacing;
        }
        
        font.drawString(textLines[i], lineX, lineY);
    }
}

//--------------------------------------------------------------
template<typename T>
void ofxTextLabel_<T>::drawString(T& font, const string& str, const ofRectangle& drawBounds, vector<string>& textLines, ofRectangle& textBounds, float lineSpacing, ofAlignHorz alignHorz, ofAlignVert alignVert)
{
    stringToLines(font, str, drawBounds.width, textLines, textBounds, lineSpacing);
    drawLines(font, textLines, textBounds, drawBounds, lineSpacing, alignHorz, alignVert);
}

//--------------------------------------------------------------
template<typename T>
ofxTextLabel_<T>::ofxTextLabel_()
: _font(NULL)
, _text("")
, _drawBounds(0, 0, 0, 0)
, _lineSpacing(1.0f)
, _alignHorz(OF_ALIGN_HORZ_LEFT)
, _alignVert(OF_ALIGN_VERT_TOP)
, _bDirty(false)
{
    
}

//--------------------------------------------------------------
template<typename T>
ofxTextLabel_<T>::~ofxTextLabel_()
{

}

//--------------------------------------------------------------
template<typename T>
void ofxTextLabel_<T>::setup(T * font, const string& text, float lineLength, float lineSpacing, ofAlignHorz alignHorz, ofAlignVert alignVert)
{
    setup(font, text, ofRectangle(0, 0, lineLength, 0), lineSpacing, alignHorz, alignVert);
}

//--------------------------------------------------------------
template<typename T>
void ofxTextLabel_<T>::setup(T * font, const string& text, const ofRectangle& drawBounds, float lineSpacing, ofAlignHorz alignHorz, ofAlignVert alignVert)
{
    setFont(font);
    setText(text);
    setDrawBounds(drawBounds);
    setLineSpacing(lineSpacing);
    setAlignHorz(alignHorz);
    setAlignVert(alignVert);
}

//--------------------------------------------------------------
template<typename T>
void ofxTextLabel_<T>::rebuild()
{
    stringToLines(*_font, _text, _drawBounds.width, _textLines, _textBounds, _lineSpacing);
    _bDirty = false;
}

//--------------------------------------------------------------
template<typename T>
bool ofxTextLabel_<T>::update()
{
    if (_bDirty) {
        rebuild();
        return true;
    }
    return false;
}

//--------------------------------------------------------------
template<typename T>
void ofxTextLabel_<T>::draw()
{
    drawLines(*_font, _textLines, _textBounds, _drawBounds, _lineSpacing, _alignHorz, _alignVert);
}

//--------------------------------------------------------------
template<typename T>
void ofxTextLabel_<T>::setFont(T * font)
{
    if (_font != font) {
        _font = font;
        _bDirty = true;
    }
}

//--------------------------------------------------------------
template<typename T>
void ofxTextLabel_<T>::setText(const string& text)
{
    if (_text != text) {
        _text = text;
        _bDirty = true;
    }
}

//--------------------------------------------------------------
template<typename T>
void ofxTextLabel_<T>::setLineLength(float lineLength)
{
    if (_drawBounds.width != lineLength) {
        _drawBounds.width = lineLength;
        _bDirty = true;
    }
}

//--------------------------------------------------------------
template<typename T>
void ofxTextLabel_<T>::setDrawBounds(const ofRectangle& drawBounds)
{
    if (_drawBounds != drawBounds) {
        if (_drawBounds.width != drawBounds.width || _drawBounds.height != drawBounds.height) {
            _bDirty = true;
        }
        _drawBounds = drawBounds;
    }
}

//--------------------------------------------------------------
template<typename T>
void ofxTextLabel_<T>::setLineSpacing(float lineSpacing)
{
    if (_lineSpacing != lineSpacing) {
        _lineSpacing = lineSpacing;
        _bDirty = true;
    }
}

//--------------------------------------------------------------
template<typename T>
void ofxTextLabel_<T>::setAlignHorz(ofAlignHorz alignHorz)
{
    if (_alignHorz != alignHorz) {
        _alignHorz = alignHorz;
        _bDirty = true;
    }
}

//--------------------------------------------------------------
template<typename T>
void ofxTextLabel_<T>::setAlignVert(ofAlignVert alignVert)
{
    if (_alignVert != alignVert) {
        _alignVert = alignVert;
        _bDirty = true;
    }
}

//--------------------------------------------------------------
template class ofxTextLabel_<ofTrueTypeFont>;

//
//  ofxTextLabel.h
//  ofxTextLabel
//
//  Created by Elie Zananiri on 2014-07-10.
//
//

#pragma once

#include <vector>
#include <string>

using namespace std;

#include "ofRectangle.h"
#include "ofConstants.h"
#include "ofTrueTypeFont.h"

//--------------------------------------------------------------
template<typename T>
class ofxTextLabel_
{
public:
    static void stringToLines(T& font, const string& str, float lineLength, vector<string>& textLines, ofRectangle& textBounds, float lineSpacing = 1.0f);
    static void drawLines(T& font, vector<string>& textLines, ofRectangle& textBounds, const ofRectangle& drawBounds, float lineSpacing = 1.0f, ofAlignHorz alignHorz = OF_ALIGN_HORZ_LEFT, ofAlignVert alignVert = OF_ALIGN_VERT_TOP);
    static void drawString(T& font, const string& str, const ofRectangle& drawBounds, vector<string>& textLines, ofRectangle& textBounds, float lineSpacing = 1.0f, ofAlignHorz alignHorz = OF_ALIGN_HORZ_LEFT, ofAlignVert alignVert = OF_ALIGN_VERT_TOP);
    
    ofxTextLabel_();
    ~ofxTextLabel_();
    
    virtual void setup(T * font, const string& text, float lineLength, float lineSpacing = 1.0f, ofAlignHorz alignHorz = OF_ALIGN_HORZ_LEFT, ofAlignVert alignVert = OF_ALIGN_VERT_TOP);
    virtual void setup(T * font, const string& text, const ofRectangle& drawBounds, float lineSpacing = 1.0f, ofAlignHorz alignHorz = OF_ALIGN_HORZ_LEFT, ofAlignVert alignVert = OF_ALIGN_VERT_TOP);
    
    virtual void rebuild();
    virtual bool update();
    virtual void draw();
    
    virtual void setFont(T * font);
    T * getFont() const { return _font; }
    
    virtual void setText(const string& text);
    const string& getText() const { return _text; }
    
    virtual void setLineLength(float lineLength);
    float getLineLength() const { return _drawBounds.width; }
    
    virtual void setDrawBounds(const ofRectangle& drawBounds);
    const ofRectangle& getDrawBounds() const {  return _drawBounds; }
    
    virtual void setLineSpacing(float lineSpacing);
    float getLineSpacing() const { return _lineSpacing; }

    virtual void setAlignHorz(ofAlignHorz alignHorz);
    ofAlignHorz getAlignHorz() const { return _alignHorz; }
    
    virtual void setAlignVert(ofAlignVert alignVert);
    ofAlignVert getAlignVert() const { return _alignVert; }
    
    const vector<string>& getTextLines() const { return _textLines; }
    const ofRectangle& getTextBounds() const { return _textBounds; }
    
    virtual void setDirty() { _bDirty = true; }
    bool isDirty() const { return _bDirty; }
    
    bool isEmpty() const { return _textLines.empty(); }
    
protected:
    T * _font;
    string _text;
    ofRectangle _drawBounds;
    
    float _lineSpacing;
    ofAlignHorz _alignHorz;
    ofAlignVert _alignVert;
        
    vector<string> _textLines;
    ofRectangle _textBounds;
    
    bool _bDirty;
};

//--------------------------------------------------------------
typedef ofxTextLabel_<ofTrueTypeFont> ofxTextLabel;


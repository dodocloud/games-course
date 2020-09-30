// This is a bad way to implement HL1 style sprite fonts, 
// but it will work for now
CHL1HudNumbers::CHL1HudNumbers( vgui::Panel *parent, 
const char *name ) : BaseClass( parent, name )
{
	vgui::Panel *pParent = g_pClientMode->GetViewport();
	SetParent( pParent );
}
	
// I don't know why, I don't want to know why, I shouldn't
// have to wonder why, but for whatever reason this stupid
// panel isn't laying out correctly unless we do this
InvalidateLayout( true );
m_pContents->InvalidateLayout( true, true );


// My hope is that this code is so awful I'm never allowed 
// to write UI code again.
float fXScale   = 1.0f / (float)iSubtileCount,
		fXOffsetL = (float)iSubtileIndex * fXScale,
		fXOffsetR = (float)(iSubtileIndex + 1) * fXScale,
		fXUpperLowerOffset = fXScale * 0.65f;
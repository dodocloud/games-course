#include "AphMain.h"
#include "TransformBuilder.h"

void TransformBuilder::BuildAndReset(GameObject* element) {
	Build(element);
	SetDefaultVals();
}

void TransformBuilder::Build(GameObject* element) {

	GameObject* parent = element->GetParent();
	Trans nodeTransform = Trans(0, 0);

	CalcTransform(nodeTransform, element, parent);


	// for rectangles, width and height are set directly instead of scale
	switch (element->GetMesh()->GetMeshType()) {
	case MeshType::NONE:
	case MeshType::RECTANGLE:
		auto rectShape = element->GetMesh<FRect>();
		rectShape->SetWidth(rectShape->GetWidth()*nodeTransform.scale.x);
		rectShape->SetHeight(rectShape->GetHeight()*nodeTransform.scale.y);
		nodeTransform.scale = ofVec3f(1);
		break;
	}

	// refresh transform (recalculate from parent)
	nodeTransform.CalcAbsTransform(parent->GetTransform());
	element->SetTransform(nodeTransform);
}

void TransformBuilder::Build(GameObject* element, GameObject* parent) {
	Trans nodeTransform = Trans(0, 0);
	CalcTransform(nodeTransform, element, parent);


	// for rectangles, width and height are set directly instead of scale
	switch (element->GetMesh()->GetMeshType()) {
	case MeshType::NONE:
	case MeshType::RECTANGLE:
		auto rectShape = element->GetMesh<FRect>();
		rectShape->SetWidth(rectShape->GetWidth()*nodeTransform.scale.x);
		rectShape->SetHeight(rectShape->GetHeight()*nodeTransform.scale.y);
		nodeTransform.scale = ofVec3f(1);
		break;
	}
	element->SetTransform(nodeTransform);
}

void TransformBuilder::Calculate(Trans& outputTrans, GameObject* element) {
	GameObject* parent = element->GetParent();
	CalcTransform(outputTrans, element, parent);
	SetDefaultVals();
}

void TransformBuilder::CalcTransform(Trans& outputTrans, GameObject* node, GameObject* parent) {

	Trans& parentTrans = parent->GetTransform();

	// calculate scale
	ofVec2f scale = CalcScale(node, parent, size.x, size.y, sType);
	// calculate position
	ofVec2f absPos = CalcPosition(node, parent, pos, pType);


	// fix position according to the anchor
	absPos.x += (0.0f - anchor.x) * node->GetMesh()->GetWidth()*scale.x;
	absPos.y += (0.0f - anchor.y) * node->GetMesh()->GetHeight()*scale.y;

	// if zIndex is equal to 0, the value will be taken from the parent
	if (zIndex == 0) zIndex = (int)parentTrans.localPos.z;

	// set transformation
	outputTrans.localPos = ofVec3f(absPos.x, absPos.y, (float)zIndex);

	outputTrans.scale = ofVec3f(scale.x, scale.y, 1);
	outputTrans.rotationCentroid = ofVec2f(node->GetMesh()->GetWidth(), node->GetMesh()->GetHeight()) * rotationCentroid * (scale); // multiply by abs scale
	outputTrans.rotation = rotation;
}

ofVec2f TransformBuilder::CalcPosition(GameObject* node, GameObject* parent, ofVec2f pos, CalcType posCalc) {
	Trans& parentTrans = parent->GetTransform();
	ofVec2f absPos;


	switch (posCalc) {
	case CalcType::ABS:
		// absolute position in pixels
		absPos = ofVec2f((pos.x - parentTrans.absPos.x) / parentTrans.absScale.x,
			(pos.y - parentTrans.absPos.y) / parentTrans.absScale.y);
		break;
	case CalcType::LOC:
		// local position is scaled according to the absolute scale of the parent
		absPos = pos;
		break;
	case CalcType::PER:
		// relative percentage -> parent size is 1.0 x 1.0
		absPos = ofVec2f(pos.x*parent->GetMesh()->GetWidth(),
			pos.y*parent->GetMesh()->GetHeight());
		break;
	}

	return absPos;
}

ofVec3f TransformBuilder::CalcScale(GameObject* node, GameObject* parent, float width, float height, CalcType scaleCalc) {

	Trans& parentTrans = parent->GetTransform();

	float scaleX = 1;
	float scaleY = 1;

	switch (scaleCalc) {
	case CalcType::ABS:
		// absolute scale
		scaleX = width / parentTrans.absScale.x;
		scaleY = height / parentTrans.absScale.y;
		break;
	case CalcType::LOC:
		// local scale, multiplied by scale of the parent
		if (width == 0 && height == 0) {
			width = 1;
			height = 1;
		}
		scaleX = width;
		scaleY = height;
		break;
	case CalcType::PER:
		// relative percentage scale ->1.0 x 1.0 will fit the whole parent
		scaleX = (width * parent->GetMesh()->GetWidth() / node->GetMesh()->GetWidth());
		scaleY = (height * parent->GetMesh()->GetHeight() / node->GetMesh()->GetHeight());
		break;
	}

	// correct auto size
	if (width != 0 && height != 0) return ofVec3f(scaleX, scaleY, 1);
	else if (width == 0) return ofVec3f(scaleY, scaleY, 1);
	else return ofVec3f(scaleX, scaleX, 1); // height = 0

}

ofVec2f TransformBuilder::GetCenter() {
	return ofVec2f(ofGetWindowSize().x / 2.0f, ofGetWindowSize().y / 2.0f);
}
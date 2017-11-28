#include "Component.h"
#include "CompValues.h"
#include "TransformBuilder.h"
#include "ParatrooperModel.h"
#include "GameValues.h"
#include "GameManager.h"
#include "CollisionManager.h"
#include "CannonController.h"
#include "ScoreComponent.h"
#include "DeathChecker.h"
#include "SoundComponent.h"
#include "ProjectileComponent.h"
#include "CopterAnimator.h"
#include "GameManager.h"
#include "CopterComponent.h"
#include "CopterSpawner.h"
#include "jsonxx.h"

using namespace jsonxx;

ParatrooperModel* ParatrooperFactory::LoadGameModel() {
	ifstream fin; 
	fin.open(ofToDataPath(FILE_CONFIG).c_str());

	Object o;
	o.parse(fin);
	fin.close();

	auto model = new ParatrooperModel();
	model->maxLandedUnits = o.get<Number>("max_landed_units");
	model->minCannonAngle = o.get<Number>("min_cannon_angle");
	model->maxCannonAngle = o.get<Number>("max_cannon_angle");
	model->cannonFireRate = o.get<Number>("cannon_fire_rate");
	model->paratrooperSpawnFrequency = o.get<Number>("paratrooper_spawn_frequency");
	model->copterSpawnFrequency = o.get<Number>("copter_spawn_frequency");
	model->copterReward = o.get<Number>("copter_reward");
	model->paratrooperFallingReward = o.get<Number>("paratrooper_falling_reward");
	model->paratrooperShotReward = o.get<Number>("paratrooper_shot_reward");
	model->shootPenalty = o.get<Number>("shoot_penalty");
	model->projectileVelocity = o.get<Number>("projectile_velocity");
	model->gravity = o.get<Number>("gravity");
	model->parachuteDecceleration = o.get<Number>("parachute_decceleration");
	model->copterSpawnMinY = o.get<Number>("copter_spawn_min_y");
	model->copterSpawnMaxY = o.get<Number>("copter_spawn_max_y");
	model->copterMinVelocity = o.get<Number>("copter_min_velocity");
	model->copterMaxVelocity = o.get<Number>("copter_max_velocity");
	model->parachuteOpenAltitude = o.get<Number>("parachute_open_altitude");
	model->parachuteOpenVelocityThreshold = o.get<Number>("parachute_open_velocity_threshold");

	return model;
}

void ParatrooperFactory::InitializeGame(GameObject* rootObject, ParatrooperModel* model) {
	
	auto scene = rootObject->GetScene();
	auto context = rootObject->GetContext();

	// create all visible objects
	auto tower = new GameObject(OBJECT_TOWER, context, scene, new ImageMesh(context->GetImage(FILE_TOWER)));
	auto turret = new GameObject(OBJECT_TURRET, context, scene, new ImageMesh(context->GetImage(FILE_TURRET)));
	auto cannon = new GameObject(OBJECT_CANNON, context, scene, new ImageMesh(context->GetImage(FILE_CANNON)));
	auto ground = new GameObject(OBJECT_GROUND, context, scene, new FRect(100, 0.3f, ofColor(0, 255, 255)));

	// add game model
	rootObject->AddAttr(MODEL, model);
	
	// create labels
	auto font = new ofTrueTypeFont();
	font->load(FILE_FONT, 20);
	
	// score
	auto score = new GameObject(context, scene, new Text(font));
	// game over label
	string text = "GAME OVER";
	auto gameOver = new GameObject(OBJECT_GAMEOVER, context, scene, new Text(font, text));
	gameOver->GetRenderable()->SetIsVisible(false);
	// number of lives
	auto lives = new GameObject(context, scene, new Text(font));
	
	// create scene graph
	rootObject->AddChild(tower);
	rootObject->AddChild(score);
	rootObject->AddChild(lives);
	rootObject->AddChild(gameOver);
	rootObject->AddChild(ground);
	tower->AddChild(turret);
	turret->AddChild(cannon);
	
	// add root components -> managers
	rootObject->AddComponent(new GameManager());
	rootObject->AddComponent(new DeathChecker());
	rootObject->AddComponent(new SoundComponent());
	rootObject->AddComponent(new CopterSpawner());
	rootObject->AddComponent(new CollisionManager());

	// add other components
	score->AddComponent(new ScoreComponent());
	lives->AddComponent(new LivesComponent());
	cannon->AddComponent(new CannonInputController());
	
	// update all transformations
	rootObject->UpdateTransformations();

	TransformBuilder transBld;
	auto meshDefaultScale = context->GetMeshDefaultScale();

	// use magic builder to set positions of all children
	transBld.RelativePosition(0.80f, 1.01f).Anchor(1, 1).ZIndex(2).LocalScale(meshDefaultScale, meshDefaultScale).BuildAndReset(score);			// score
	transBld.RelativePosition(0.10f, 1.01f).Anchor(1, 1).ZIndex(2).LocalScale(meshDefaultScale, meshDefaultScale).BuildAndReset(lives);			// lives
	transBld.RelativePosition(0.5f, 0.5f).Anchor(0.5f, 0.5f).ZIndex(2).LocalScale(meshDefaultScale, meshDefaultScale).BuildAndReset(gameOver);	// game over label
	transBld.RelativePosition(0.5f, 0.94f).Anchor(0.5f, 1).LocalScale(meshDefaultScale, meshDefaultScale).ZIndex(2).BuildAndReset(tower);		// tower
	transBld.RelativePosition(0.5f, 0).Anchor(0.5f, 1).ZIndex(2).BuildAndReset(turret);															// turret
	transBld.RelativePosition(0.5f, 0.35f).Anchor(0.5f, 1).ZIndex(1).RotationCenter(0.5f, 1).BuildAndReset(cannon);								// cannon
	transBld.RelativePosition(0, 0.94f).Anchor(0, 1).ZIndex(1).BuildAndReset(ground);															// ground
}

void ParatrooperFactory::CreateProjectile(GameObject* canon, ParatrooperModel* model) {
	auto projectileImg = canon->GetContext()->GetImage(FILE_PROJECTILE);
	GameObject* projectile = new GameObject(canon->GetContext(), canon->GetScene(), new ImageMesh(projectileImg));
	projectile->SetFlag(FLAG_PROJECTILE);

	auto rootObject = canon->GetRoot();
	auto canonTrans = canon->GetTransform();

	TransformBuilder transBld;

	rootObject->AddChild(projectile);

	float rotation = canon->GetTransform().rotation;
	auto absWidth = canonTrans.absScale.x * canon->GetRenderable()->GetWidth();
	auto absHeight = canonTrans.absScale.y * canon->GetRenderable()->GetHeight();
	auto meshDefaultScale = canon->GetContext()->GetMeshDefaultScale();

	// we need the projectile to be at the same location as the cannon with current rotation
	transBld.AbsolutePosition(canonTrans.absPos.x + absWidth * 0.5f + absHeight * sin(rotation), 
		canonTrans.absPos.y + absHeight - absHeight * cos(rotation))
		.LocalScale(meshDefaultScale, meshDefaultScale).Build(projectile);

	float velocityX = model->projectileVelocity * cos(rotation - PI / 2);
	float velocityY = model->projectileVelocity * sin(rotation - PI / 2);

	auto dynamics = new Dynamics();
	dynamics->SetVelocity(ofVec2f(velocityX, velocityY));
	dynamics->SetAcceleration(ofVec2f(0, model->gravity)); // add gravity

	projectile->AddAttr(ATTR_DYNAMICS, dynamics);
	projectile->AddComponent(new ProjectileComponent());
	ofLogNotice("Factory", "Projectile created");
}

void ParatrooperFactory::CreateParatrooper(GameObject* owner, ParatrooperModel* model) {
	auto paratrooperMesh = new ImageMesh(owner->GetContext()->GetImage(FILE_PARATROOPER));
	GameObject* paratrooper = new GameObject(OBJECT_PARATROOPER, owner->GetContext(), owner->GetScene(), paratrooperMesh);
	paratrooper->SetFlag(FLAG_COLLIDABLE);
	paratrooper->SetTransform(owner->GetTransform());

	auto dynamics = new Dynamics();
	dynamics->SetAcceleration(ofVec2f(0, model->gravity));
	paratrooper->AddAttr(ATTR_DYNAMICS, dynamics);

	auto rootObject = owner->GetRoot();
	rootObject->AddChild(paratrooper);
	paratrooper->AddAttr(PARA_STATE, ParaState::FALLING);
	paratrooper->AddComponent(new ParatrooperComponent());
	ofLogNotice("Factory", "Paratrooper created");
}

void ParatrooperFactory::CreateCopter(GameObject* owner, ParatrooperModel* model) {
	auto copterLeft = owner->GetContext()->GetImage(FILE_COPTER_LEFT);
	auto copterImage = new ImageMesh(copterLeft);
	GameObject* copter = new GameObject(OBJECT_COPTER, owner->GetContext(), owner->GetScene(), copterImage);
	copter->SetFlag(FLAG_COLLIDABLE);

	auto rootObject = owner->GetRoot();

	rootObject->AddChild(copter);
	TransformBuilder transBld;

	// 50% probability that the copter will be spawned on the left side
	bool spawnLeft = ofRandom(0, 1) > 0.5f;

	float posY = ofRandom(model->copterSpawnMinY, model->copterSpawnMaxY);
	float posX = spawnLeft ? -0.2f : 1.2f;

	auto meshDefaultScale = owner->GetContext()->GetMeshDefaultScale();
	transBld.RelativePosition(posX, posY)
	.Anchor(0.5f, 0.5f)
	.LocalScale(meshDefaultScale, meshDefaultScale).Build(copter);

	float velocity = (spawnLeft ? 1 : -1) * ofRandom(model->copterMinVelocity, model->copterMaxVelocity);
	auto dynamics = new Dynamics();
	dynamics->SetVelocity(ofVec2f(velocity, 0));
	copter->AddAttr(ATTR_DYNAMICS, dynamics);

	copter->AddComponent(new CopterComponent());
	copter->AddComponent(new CopterAnimator());
	ofLogNotice("Factory", "Copter created");
}

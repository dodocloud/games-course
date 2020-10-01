// Creates boards and markers around mission Area
_xPos = position (_this select 0) select 0;
_yPos = position (_this select 0) select 1;
 
_howBigA = _this select 1;
_howBigB = _this select 2;
_tablesC = _this select 3;
_angle = _this select 4;
_i = 0;
 
while (_i < 360) do {
  _x = (_howBighA * (sin _i));
  _y = (_howBigB * (cos _i));
  _x_rot = _xPos + _x*(cos _angle) - _y*(sin _angle);
  _y_rot = _yPos + _x*(sin _angle) + _y*(cos _angle);
  _k = createVehicle ["Danger", [_x_rot, _y_rot, 0], [], 0, "NONE"];
  _m = createMarker [format ["Marker" + str _i], [_x_rot, _y_rot, 0]];
  format ["Marker" + str _i] setMarkerType "Dot";
  _k setDir _i;
  format ["Marker" + str _i] setMarkerDir(_i - _angle);
  _i = _i + 360/_tablesC;
};
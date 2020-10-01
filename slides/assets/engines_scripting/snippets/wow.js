local total, completed =  GetNumCompletedAchievements(); 
 
if total > completed then 
  print("You have completed ", completed, " out of " ,total," achievements"); 
  x= completed/total*100;
  print("That is only ",x," percent"); 
end 
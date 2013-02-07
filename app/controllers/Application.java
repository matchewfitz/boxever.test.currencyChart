package controllers;

import play.*;
import play.mvc.*;

public class Application extends Controller {
	  
	public static Result index() {
		return redirect(routes.Application.newChart());
	}
	  
	//render the page
	public static Result newChart(){
		return ok(
			views.html.index.render()
		);
	}
	  
	//get the latest data
	public static Result getData(){ 
		return DataManager.getData();
	}
	  
	  //provide routes to allow javascript to access backend functions.
	public static Result javascriptRoutes() {
		response().setContentType("text/javascript");
		return ok(
			Routes.javascriptRouter("myJsRoutes",
				routes.javascript.Application.newChart(),
				routes.javascript.Application.getData()
			)
		);
	}
}
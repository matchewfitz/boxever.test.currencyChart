package controllers;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Calendar;
import java.util.Date;

import play.mvc.Controller;
import play.mvc.Result;



public class DataManager extends Controller {
	private static String ECB_DATA_URL = "http://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml";
	private static String LOCAL_ECB_DATA_PATH = "conf/ecb_euro_dollar_90_days.xml";
	
	//handle the getData request and response.
	//Just as an aside, I'm not keen on passing an inputstream... maybe it's ok but it just doesn't seem kosher.
	public static Result getData(){
		response().setContentType("text/xml;charset=UTF-8");
		try{
			return ok(getLocalData());			
		}catch(IOException e){
			return internalServerError(e.getMessage());
		}
	}
	
	//check if local data is up to date, otherwise fetch latest data from ECB
	//TODO: support locale
	public static FileInputStream getLocalData() throws IOException{
		File ecbFile = new File(LOCAL_ECB_DATA_PATH);		
		Calendar ecbUpdateTime = Calendar.getInstance();
		ecbUpdateTime.set(Calendar.HOUR_OF_DAY, 16);
		ecbUpdateTime.set(Calendar.MINUTE, 0);
		ecbUpdateTime.set(Calendar.SECOND, 0);
		Calendar fileTimeStamp = Calendar.getInstance();
		Date fileModifiedDate = new Date(ecbFile.lastModified());
		fileTimeStamp.setTime(fileModifiedDate);
		
		if(fileTimeStamp.before(ecbUpdateTime)){
			//update the local data
			getLatestData();
		}
		//return the inputStream
		return new FileInputStream(ecbFile);
	}
	
	//make an external request for the data and save it to disk
	private static void getLatestData() throws IOException{
		URL ecbData = new URL(ECB_DATA_URL);
		InputStream in = ecbData.openStream();
		FileOutputStream out = new FileOutputStream(LOCAL_ECB_DATA_PATH);
		byte data[] = new byte[4 * 1024];
		int bytesRead;
		while((bytesRead = in.read(data))!=-1){
			out.write (data,0,bytesRead);
		}
		in.close();
		out.close();
	}
}
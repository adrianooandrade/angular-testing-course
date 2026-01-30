import {CalculatorService} from "./calculator.service";
import {LoggerService} from "./logger.service";
import {TestBed} from "@angular/core/testing";


describe('CalculatorService', () => {

  let loggerService: any;
  let calculatorService: CalculatorService;



  beforeEach(() => {
    loggerService = new LoggerService();

    // spyOn(loggerService, 'log');
    // or:
    loggerService = jasmine.createSpyObj('LoggerService', ['log']);

    // calculatorService = new CalculatorService(loggerService);
    // or:
    TestBed.configureTestingModule({
      providers: [
        CalculatorService,
        { provide: LoggerService, useValue: loggerService }
      ]
    });

    calculatorService = TestBed.inject(CalculatorService);

  })

  it('should add two numbers', () => {

    const result = calculatorService.add(1,2);

    expect(result).toBe(3);
    expect(loggerService.log).toHaveBeenCalledTimes(1);
  })

  it('should subtract two numbers', () => {
    // Removing repeated logic with beforeEach so that we don't have be creating services on repeat for different tests
    // Also better if we use TestBed
    // calculatorService = new CalculatorService(new LoggerService());

    const result = calculatorService.subtract(1,2);

    expect(result).toBe(-1, "Unexpected subtraction result");
    expect(loggerService.log).toHaveBeenCalledTimes(1);
  })
})

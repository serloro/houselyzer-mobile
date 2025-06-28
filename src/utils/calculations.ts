import { MortgageCalculation } from '../types';

export const calculateMortgage = (
  homePrice: number,
  downPaymentPercent: number,
  interestRate: number,
  loanTermYears: number,
  propertyTaxAnnual: number = 0,
  insuranceAnnual: number = 0
): MortgageCalculation => {
  const downPayment = (homePrice * downPaymentPercent) / 100;
  const loanAmount = homePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  let monthlyPayment = 0;
  if (monthlyRate > 0) {
    monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  } else {
    monthlyPayment = loanAmount / numberOfPayments;
  }

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  const monthlyPropertyTax = propertyTaxAnnual / 12;
  const monthlyInsurance = insuranceAnnual / 12;
  const pmi = loanAmount > homePrice * 0.8 ? (loanAmount * 0.005) / 12 : 0;

  return {
    loanAmount,
    interestRate,
    loanTerm: loanTermYears,
    downPayment,
    propertyTax: monthlyPropertyTax,
    insurance: monthlyInsurance,
    pmi,
    monthlyPayment: monthlyPayment + monthlyPropertyTax + monthlyInsurance + pmi,
    totalInterest,
    totalPayment,
  };
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const locale = currency === 'EUR' ? 'es-ES' : 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};
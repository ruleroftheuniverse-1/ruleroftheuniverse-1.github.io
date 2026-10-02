(() => {
const TOPIC_STORAGE = "hesi-smoo-v0.1";
const q = (selector) => document.querySelector(selector);
const topicKey = new URLSearchParams(location.search).get("topic") || "vocab";

const vocabItems = [
  ["acute","Acute","The symptoms had an acute onset.","Sudden in onset and often short in duration."],
  ["abstain","Abstain","She was told to abstain from food before the procedure.","To choose not to do or have something."],
  ["insidious","Insidious","The condition can have an insidious progression.","Developing gradually or subtly, often with harmful effects."],
  ["adverse","Adverse","The chart notes an adverse reaction to the medication.","Harmful or unfavorable."],
  ["alleviate","Alleviate","The intervention may alleviate discomfort.","To make pain or a problem less severe."],
  ["benign","Benign","The biopsy showed a benign growth.","Not harmful; not cancerous in a medical context."],
  ["coherent","Coherent","The patient remained coherent during the assessment.","Clear, logical, and able to be understood."],
  ["exacerbate","Exacerbate","Skipping the dose could exacerbate the symptoms.","To make a problem worse."],
  ["lethargic","Lethargic","After the procedure, he appeared lethargic.","Very tired, sluggish, or lacking energy."],
  ["mitigate","Mitigate","Frequent breaks can mitigate the risk of fatigue.","To make something less severe or harmful."],
  ["negligible","Negligible","The change in temperature was negligible.","So small that it is not important in context."],
  ["obsolete","Obsolete","That filing system is now obsolete.","No longer used because something newer has replaced it."],
  ["prevalent","Prevalent","Seasonal allergies are prevalent in the spring.","Common or widespread."],
  ["prognosis","Prognosis","The clinician discussed the prognosis with the family.","A prediction about the likely course or outcome of a condition."],
  ["reluctant","Reluctant","She was reluctant to begin an unfamiliar task.","Unwilling or hesitant."],
  ["transient","Transient","The dizziness was transient and resolved quickly.","Temporary; lasting only a short time."],
  ["meticulous","Meticulous","The technician kept meticulous records.","Very careful and precise about details."],
  ["plausible","Plausible","The explanation sounded plausible, but it needed evidence.","Seeming reasonable or believable."],
  ["ambiguous","Ambiguous","The instruction was ambiguous, so two staff members interpreted it differently.","Open to more than one meaning; unclear."],
  ["assess","Assess","The nurse will assess the patient’s pain before giving additional medication.","To examine or evaluate carefully."],
  ["chronic","Chronic","He receives care for chronic back pain.","Continuing for a long time or recurring over time."],
  ["comply","Comply","The patient agreed to comply with the preparation instructions.","To act according to a rule, request, or instruction."],
  ["deficit","Deficit","The evaluation found a small memory deficit after the injury.","A shortage or a loss of an ability or amount."],
  ["deteriorate","Deteriorate","The team watched for signs that the patient’s condition might deteriorate.","To become worse."],
  ["disseminate","Disseminate","The clinic disseminated the updated safety guidance to all employees.","To spread information widely."],
  ["disoriented","Disoriented","After waking, the patient was briefly disoriented about the time and place.","Confused about one’s surroundings, time, or situation."],
  ["elicit","Elicit","The open-ended question helped elicit a fuller description of the symptoms.","To draw out or bring forth a response or information."],
  ["eradicate","Eradicate","Public-health campaigns aim to eradicate diseases when possible.","To destroy or eliminate completely."],
  ["ethical","Ethical","The committee reviewed whether the proposed study was ethical.","Consistent with principles about right conduct and fair treatment."],
  ["facilitate","Facilitate","Clear labels facilitate faster access to emergency supplies.","To make an action or process easier."],
  ["futile","Futile","Repeating the same failed step would be futile without changing the plan.","Unable to produce a useful result; pointless."],
  ["imminent","Imminent","The weather alert warned that severe conditions were imminent.","About to happen very soon."],
  ["inhibit","Inhibit","Fear of embarrassment can inhibit people from asking questions.","To hold back, prevent, or slow down."],
  ["mandatory","Mandatory","Hand hygiene is mandatory before entering the unit.","Required; not optional."],
  ["minimal","Minimal","The wound showed minimal swelling after treatment.","Very small in amount or degree."],
  ["notify","Notify","Notify the provider immediately if the symptoms worsen.","To formally tell or inform someone."],
  ["obtain","Obtain","The technician must obtain a labeled specimen before the test can begin.","To get or acquire."],
  ["perceive","Perceive","Two people may perceive the same conversation differently.","To notice, understand, or interpret through the senses or mind."],
  ["precede","Precede","A brief pause may precede the onset of a migraine.","To come before in time, order, or position."],
  ["profound","Profound","The medication had a profound effect on her level of alertness.","Very great, deep, or intense."],
  ["reconcile","Reconcile","The pharmacist reconciled the medication list with the patient’s current bottles.","To compare and bring into agreement; resolve differences."],
  ["susceptible","Susceptible","People with weakened immune systems may be more susceptible to infection.","More likely to be affected or harmed by something."],
  ["validate","Validate","A second test was used to validate the original result.","To confirm that something is accurate, sound, or acceptable."],
  ["voluntary","Voluntary","Participation in the survey was voluntary.","Done by choice rather than required."],
  ["vulnerable","Vulnerable","The plan gives extra support to vulnerable patients during heat emergencies.","More open to harm, injury, or difficulty."],
  ["concurrent","Concurrent","The patient was treated for two concurrent conditions.","Happening at the same time."],
  ["consistent","Consistent","The results were consistent with the earlier measurements.","In agreement with something else; reliably similar over time."],
  ["contradict","Contradict","The new account seemed to contradict the earlier report.","To state or show the opposite of something."],
  ["explicit","Explicit","The discharge instructions were explicit about when to call for help.","Stated clearly and directly, leaving little room for doubt."],
  ["indicate","Indicate","A high temperature may indicate that further assessment is needed.","To point out, show, or suggest."],
  ["maintain","Maintain","The patient was asked to maintain the same schedule for one week.","To keep something in its existing state or condition."],
  ["priority","Priority","Airway concerns take priority over routine paperwork.","Something that deserves attention before other things."],
  ["relevant","Relevant","Only information relevant to the symptom should guide this decision.","Closely connected to the matter being considered."],
  ["restore","Restore","The treatment helped restore normal movement in the joint.","To bring back to a previous condition or function."],
  ["subsequent","Subsequent","The subsequent test was completed after the initial screening.","Coming later in time or order."],
  ["terminal","Terminal","The terminal stage of a process is its final stage.","Final; occurring at the end of a process or sequence."],
  ["tolerate","Tolerate","The patient could not tolerate the medication because of nausea.","To endure or handle without an unacceptable reaction."],
  ["undergo","Undergo","The sample will undergo additional testing tomorrow.","To experience or be subjected to a process or treatment."],
  ["verify","Verify","Verify the patient’s identity before giving medication.","To check and confirm that something is true or correct."]
].map((x) => ({id:x[0],word:x[1],example:x[2],answer:x[3],kind:"vocab"}));

const seedMathItems = [
  ["fraction-mixed-decimal","math-fractions","Fraction conversion","What is 2 3/8 written as a decimal?",["2.38","2.375","2.625","2.83"],"2.375","3 ÷ 8 = 0.375, so 2 3/8 = 2.375."],
  ["fraction-decimal","math-fractions","Fraction conversion","Which fraction is equal to 0.45?",["9/20","4/5","45/10","1/4"],"9/20","0.45 = 45/100. Divide numerator and denominator by 5 to get 9/20."],
  ["fraction-add","math-fractions","Fraction arithmetic","A patient drinks 3/4 cup of water in the morning and 2/3 cup in the afternoon. How much is that altogether?",["1 1/12 cups","1 5/12 cups","1 1/2 cups","5/7 cup"],"1 5/12 cups","Use twelfths: 3/4 = 9/12 and 2/3 = 8/12. Together: 17/12 = 1 5/12."],
  ["fraction-subtract","math-fractions","Fraction arithmetic","What is 5/6 − 1/4?",["1/2","7/12","2/10","1 1/12"],"7/12","Use twelfths: 5/6 = 10/12 and 1/4 = 3/12. Then 10/12 − 3/12 = 7/12."],
  ["fraction-multiply","math-fractions","Fraction arithmetic","What is 3/5 of 40?",["15","24","32","75"],"24","3/5 × 40 = 3 × 8 = 24."],
  ["decimal-multiply","math-decimals","Decimal operations","What is 3.6 × 0.4?",["0.144","1.44","14.4","1.04"],"1.44","36 × 4 = 144. There are two decimal places total, so the answer is 1.44."],
  ["decimal-divide","math-decimals","Decimal operations","What is 7.2 ÷ 0.6?",["1.2","12","120","0.12"],"12","Move both decimals one place: 72 ÷ 6 = 12."],
  ["decimal-add","math-decimals","Decimal operations","What is 4.08 + 0.67?",["4.15","4.75","4.715","5.08"],"4.75","Line up the decimal points: 4.08 + 0.67 = 4.75."],
  ["decimal-place","math-decimals","Decimal place value","A medication order is for 0.025 g. How many milligrams is that?",["0.25 mg","2.5 mg","25 mg","250 mg"],"25 mg","One gram is 1,000 mg. Multiply 0.025 by 1,000 to get 25 mg."],
  ["percent-of","math-percent","Percent","A dose is reduced by 25% from 80 mg. How many milligrams are reduced?",["20 mg","25 mg","55 mg","60 mg"],"20 mg","25% = 0.25. One quarter of 80 is 20."],
  ["percent-whole","math-percent","Percent","Thirty is 15% of what number?",["45","150","200","450"],"200","Part = percent × whole. 30 = 0.15 × whole, so whole = 30 ÷ 0.15 = 200."],
  ["percent-increase","math-percent","Percent change","A price rises from $40 to $50. What is the percent increase?",["10%","20%","25%","125%"],"25%","The increase is $10. Compare it to the original: 10 ÷ 40 = 0.25 = 25%."],
  ["percent-discount","math-percent","Percent","A $60 item is on sale for 30% off. What is the sale price?",["$18","$30","$42","$78"],"$42","Find the discount first: 0.30 × 60 = 18. Then subtract: 60 − 18 = 42."],
  ["percent-decimal","math-percent","Percent conversion","What is 0.375 written as a percent?",["3.75%","37.5%","375%","0.375%"],"37.5%","Multiply a decimal by 100 to write it as a percent: 0.375 × 100 = 37.5%."],
  ["ratio-proportion","math-ratios","Ratios and proportions","A mixture uses 2 cups of concentrate for every 5 cups of water. How many cups of concentrate are needed for 20 cups of water?",["4","6","8","10"],"8","20 is four groups of 5, so the concentrate is four groups of 2: 8 cups."],
  ["ratio-share","math-ratios","Ratios","The ratio of red to blue folders is 3:2. If there are 30 folders total, how many are blue?",["10","12","18","20"],"12","There are 5 total parts. Each part is 30 ÷ 5 = 6. Blue has 2 parts: 12."],
  ["proportion-solve","math-ratios","Proportions","Solve: 4/7 = x/28",["12","16","21","24"],"16","28 is four times 7, so x is four times 4: 16."],
  ["unit-conversion","math-conversions","Conversions","A bottle contains 1.5 liters. How many milliliters is that?",["150 mL","500 mL","1,050 mL","1,500 mL"],"1,500 mL","One liter is 1,000 mL. Multiply 1.5 by 1,000."],
  ["weight-conversion","math-conversions","Conversions","How many ounces are in 3 pounds?",["24","36","48","96"],"48","One pound is 16 ounces. 3 × 16 = 48."],
  ["military-time","math-conversions","Military time","What time is 18:45 in standard time?",["6:45 AM","8:45 AM","6:45 PM","8:45 PM"],"6:45 PM","For hours over 12, subtract 12: 18 − 12 = 6. The time is PM."],
  ["roman","math-conversions","Roman numerals","What number does IV represent?",["4","6","9","11"],"4","A smaller numeral before a larger one is subtracted: V − I = 4."],
  ["rate","math-rates","Rates","An IV bag delivers 480 mL over 4 hours. What is the average rate in mL per hour?",["96","120","160","1,920"],"120","Rate = amount ÷ time: 480 ÷ 4 = 120 mL/hour."],
  ["unit-rate","math-rates","Unit rates","A worker labels 45 vials in 9 minutes. At the same rate, how many vials are labeled per minute?",["4","5","9","36"],"5","A unit rate means one minute: 45 ÷ 9 = 5 vials per minute."],
  ["distance-rate","math-rates","Rates","A car travels 150 miles in 3 hours. What is its average speed?",["30 mph","50 mph","75 mph","450 mph"],"50 mph","Speed = distance ÷ time: 150 ÷ 3 = 50 miles per hour."],
  ["equation","math-equations","Equations","Solve: 4x + 7 = 31",["4","6","8","9.5"],"6","Subtract 7: 4x = 24. Divide by 4: x = 6."],
  ["multi-equation","math-equations","Equations","Solve: 3(x − 2) = 21",["5","7","9","13"],"9","Divide by 3 first: x − 2 = 7. Add 2: x = 9."],
  ["pemdas","math-equations","Order of operations","What is 18 ÷ 3 + 2 × 4?",["8","14","32","48"],"14","Do multiplication and division first: 18 ÷ 3 = 6 and 2 × 4 = 8. Then add: 14."],
  ["expression","math-equations","Algebraic expressions","If y = 5, what is 2y² − 3?",["7","22","47","97"],"47","Substitute 5: 2 × 5² − 3 = 2 × 25 − 3 = 47."]
].map((x) => ({id:x[0],group:x[1],topic:x[2],prompt:x[3],choices:x[4],answer:x[5],explanation:x[6],kind:"question"}));

// Parameterized original math items. Values are deliberately finite and inspected:
// generation gives breadth without turning answer keys into a hallucination problem.
const number = (value) => String(Number(value.toFixed(4)));
const question = (id, group, topic, prompt, choices, answer, explanation) => ({id,group,topic,prompt,choices:[...new Set(choices.map(String))],answer:String(answer),explanation,kind:"question"});
const generatedMathItems = [
  ...[
    [1,8,"0.125"],[3,8,"0.375"],[5,8,"0.625"],[7,8,"0.875"],
    [1,4,"0.25"],[3,4,"0.75"],[1,5,"0.2"],[2,5,"0.4"],[3,5,"0.6"],[4,5,"0.8"]
  ].map(([top,bottom,decimal]) => question(
    `generated-fraction-decimal-${top}-${bottom}`,"math-fractions","Fraction conversion",
    `What is ${top}/${bottom} written as a decimal?`,
    [decimal, number(top/(bottom*10)), number((top+1)/bottom), number(top/bottom*10)], decimal,
    `Divide ${top} by ${bottom}: ${top} ÷ ${bottom} = ${decimal}.`
  )),
  ...[
    [1,3,1,6,1,2],[3,4,1,8,7,8],[5,6,1,3,1,6],[2,5,3,10,7,10],
    [7,8,1,4,5,8],[3,5,1,4,17,20],[5,12,1,3,3,4],[7,10,1,5,9,10]
  ].map(([a,b,c,d,n,den]) => question(
    `generated-fraction-add-${a}-${b}-${c}-${d}`,"math-fractions","Fraction arithmetic",
    `What is ${a}/${b} + ${c}/${d}?`,
    [`${n}/${den}`,`${a+c}/${b+d}`,`${Math.abs(a-c)}/${den}`,`${n}/${b+d}`], `${n}/${den}`,
    `Use a shared denominator of ${den}: ${a}/${b} + ${c}/${d} = ${n}/${den}.`
  )),
  ...[
    [2.4,0.3,0.72],[1.25,0.4,0.5],[0.06,0.7,0.042],[3.5,0.08,0.28],
    [4.2,0.05,0.21],[0.9,0.6,0.54],[2.75,0.2,0.55],[1.6,0.25,0.4]
  ].map(([a,b,result]) => question(
    `generated-decimal-multiply-${String(a).replace(".","p")}-${String(b).replace(".","p")}`,"math-decimals","Decimal multiplication",
    `What is ${a} × ${b}?`, [result, number(result*10), number(result/10), number(a*b*100)], result,
    `Multiply as whole numbers, then place the decimal using the total decimal places: ${a} × ${b} = ${result}.`
  )),
  ...[
    [4.8,0.6,8],[3.75,0.5,7.5],[0.84,0.07,12],[6.3,0.9,7],
    [2.4,0.08,30],[5.25,0.25,21],[1.44,0.12,12],[0.96,0.3,3.2]
  ].map(([a,b,result]) => question(
    `generated-decimal-divide-${String(a).replace(".","p")}-${String(b).replace(".","p")}`,"math-decimals","Decimal division",
    `What is ${a} ÷ ${b}?`, [result, number(result/10), number(result*10), number(a*b)], result,
    `Make the divisor a whole number by moving both decimals equally, then divide. ${a} ÷ ${b} = ${result}.`
  )),
  ...[
    [15,240,36],[20,75,15],[12.5,160,20],[35,80,28],[5,360,18],[40,125,50]
  ].map(([percent,whole,part]) => question(
    `generated-percent-of-${percent}-${whole}`,"math-percent","Percent of a quantity",
    `What is ${percent}% of ${whole}?`, [part, number(whole-percent), number(whole*(percent/1000)), number(whole+part)], part,
    `${percent}% = ${percent/100}. Multiply: ${percent/100} × ${whole} = ${part}.`
  )),
  ...[
    [18,45,40],[35,70,50],[12,30,40],[24,60,40],[27,90,30],[16,64,25]
  ].map(([part,percent,whole]) => question(
    `generated-percent-whole-${part}-${percent}`,"math-percent","Finding the whole",
    `${part} is ${percent}% of what number?`, [whole, number(part*percent/100), number(part+percent), number(whole*percent/100)], whole,
    `Write ${part} = ${percent/100} × whole. Then whole = ${part} ÷ ${percent/100} = ${whole}.`
  )),
  ...[
    [50,65,30],[80,100,25],[120,90,25],[40,50,25],[200,230,15],[75,60,20]
  ].map(([start,end,change]) => question(
    `generated-percent-change-${start}-${end}`,"math-percent","Percent change",
    `A value changes from ${start} to ${end}. What is the percent ${end>start?"increase":"decrease"}?`,
    [`${change}%`,`${number(Math.abs(end-start))}%`,`${number((end/start)*100)}%`,`${number(change/10)}%`], `${change}%`,
    `The change is ${Math.abs(end-start)}. Compare it with the original value: ${Math.abs(end-start)} ÷ ${start} = ${change/100} = ${change}%.`
  )),
  ...[
    [3,4,28,16],[2,5,35,25],[5,3,48,18],[4,7,44,28],[1,6,56,48],[7,2,36,8]
  ].map(([left,right,total,answer]) => question(
    `generated-ratio-share-${left}-${right}-${total}`,"math-ratios","Ratios",
    `The ratio of red to blue beads is ${left}:${right}. If there are ${total} beads total, how many are blue?`,
    [answer, left*(total/(left+right)), total-left, answer+(total/(left+right))], answer,
    `There are ${left+right} total parts. Each part is ${total} ÷ ${left+right} = ${total/(left+right)}. Blue has ${right} parts, so ${answer}.`
  )),
  ...[
    [2,5,30,12],[3,8,64,24],[5,12,96,40],[4,7,56,32],[9,10,50,45],[3,4,84,63]
  ].map(([amount,time,newTime,answer]) => question(
    `generated-rate-${amount}-${time}-${newTime}`,"math-rates","Rates",
    `A pump moves ${amount} mL in ${time} minutes. At the same rate, how many mL will it move in ${newTime} minutes?`,
    [answer, amount*newTime, amount/time, amount+newTime], answer,
    `First find the unit rate: ${amount} ÷ ${time} = ${amount/time} mL per minute. Then multiply by ${newTime}: ${answer} mL.`
  )),
  ...[
    [2.5,"L","mL",2500],[0.75,"kg","g",750],[3.2,"m","cm",320],[1.25,"hours","minutes",75],
    [2.4,"days","hours",57.6],[0.45,"L","mL",450]
  ].map(([amount,from,to,answer]) => question(
    `generated-conversion-${String(amount).replace(".","p")}-${from}-${to}`,"math-conversions","Unit conversion",
    `How many ${to} are in ${amount} ${from}?`, [answer, number(answer/10), number(answer*10), number(amount)], answer,
    `${amount} ${from} = ${answer} ${to}. Use the conversion factor so the original unit cancels before calculating.`
  )),
  ...[
    [5,9,34,5],[7,4,39,5],[3,8,11,1],[6,5,41,6],[4,7,47,10],[9,2,47,5]
  ].map(([coefficient,constant,total,answer]) => question(
    `generated-equation-${coefficient}-${constant}-${total}`,"math-equations","One-variable equations",
    `Solve: ${coefficient}x + ${constant} = ${total}`, [answer, total-constant, number(answer+1), number(answer-1)], answer,
    `Subtract ${constant}: ${coefficient}x = ${total-constant}. Divide by ${coefficient}: x = ${answer}.`
  ))
];
const mathItems = [...seedMathItems, ...generatedMathItems];

const readingItems = [
  ["reading-main-idea-1","reading-main-idea","Main idea","At a community clinic, missed appointments had been rising for months. Staff first assumed patients simply forgot. A review showed that many reminders were sent only in English, while a large group of patients preferred Spanish. After the clinic began sending reminders in both languages, missed appointments declined. The staff then kept reviewing the data rather than assuming the first explanation would always be correct.","What is the passage mainly about?",["Patients prefer bilingual staff to medical care.","Data review helped the clinic identify and address a cause of missed appointments.","English reminders are never useful.","Most missed appointments are caused by forgetfulness."],1,"The passage traces a problem, an initial assumption, evidence that challenged it, and a change that improved outcomes."],
  ["reading-main-idea-2","reading-main-idea","Main idea","A school garden produced more vegetables than expected in its first year. The organizers did not simply celebrate the harvest. They recorded which beds received the most sunlight, which crops needed the least water, and which weeks had the most volunteer help. Next year, they plan to use those records to decide what to plant and where.","What is the main idea of the passage?",["The garden was unexpectedly successful because of volunteer help.","The organizers are using evidence from the first year to improve future planning.","Vegetables need more sunlight than water.","The school should build more garden beds."],1,"The whole passage is about learning from records to make a better next-round decision—not any one detail about vegetables, sun, or volunteers."],
  ["reading-purpose-1","reading-purpose","Author’s purpose","The library extended its weekend hours during exam season. It did not expect the change to solve every student’s problem. Instead, librarians wanted to test whether a quieter study space at a different time would help students who worked during the day. Attendance records and a short survey would determine whether the new hours were continued.","Why did the library extend its weekend hours?",["To promise that every student would study more.","To test whether a different access schedule would help a particular group of students.","To replace all daytime library hours.","To collect attendance data for its own sake."],1,"The stated aim is a test of whether the changed schedule helps students who work during the day."],
  ["reading-purpose-2","reading-purpose","Author’s purpose","A hospital newsletter explains that hand hygiene audits will take place over the next month. It describes when observers may be present, how results will be reported, and where staff can find the current protocol. It does not argue that any particular employee has performed poorly.","The newsletter’s main purpose is to",["punish staff members who fail an audit.","explain an upcoming process and direct staff to relevant information.","prove that current hygiene practices are ineffective.","compare two hospitals’ infection rates."],1,"The newsletter informs staff about the process; it is not an accusation or a research comparison."],
  ["reading-inference-1","reading-inference","Inference","A town installed several water refill stations in its parks. In the first month, the stations were used most often near playgrounds and athletic fields, especially on hot afternoons. The town plans to add shade near those locations before next summer.","What can reasonably be inferred from the passage?",["All park visitors carry reusable bottles.","The town believes heat and activity may increase demand for water at the busiest stations.","The refill stations were too expensive to operate.","Shade will eliminate the need for water stations."],1,"High use near active areas on hot afternoons gives the town a reason to add shade there; the other claims go beyond the evidence."],
  ["reading-inference-2","reading-inference","Inference","During a pilot program, a clinic offered evening telehealth appointments twice a week. Those slots filled more slowly than daytime appointments for the first two weeks. By the end of the second month, however, most evening slots were booked, and several patients said the schedule let them avoid missing work.","Which inference is best supported?",["Evening appointments are always preferred to daytime appointments.","Awareness or adjustment time may have affected early use of the evening appointments.","Telehealth is less effective than in-person care.","Patients who work cannot use daytime appointments."],1,"Use increased over time, so the early slow filling does not show the service lacked value. The passage supports a cautious inference about awareness or adjustment."],
  ["reading-detail-1","reading-detail","Supporting detail","A hospital unit changed its shift handoff form. The old form listed tasks but did not require nurses to record which tasks had been completed. The new form added a completion field and a space for unresolved concerns. After six weeks, nurses reported fewer duplicate calls at the beginning of each shift.","Which detail best supports the idea that the new form improved handoffs?",["The unit changed its form.","The old form listed tasks.","The new form had a completion field.","Nurses reported fewer duplicate calls after the change."],3,"The reduction in duplicate calls is the outcome evidence that the handoff process improved."],
  ["reading-detail-2","reading-detail","Supporting detail","A city opened a small cooling center during a heat advisory. It was placed near a bus route, stayed open until 8 p.m., and offered water. At the end of the week, staff found that attendance was highest from 4 p.m. to 7 p.m., when many nearby stores had already closed.","Which detail most directly supports the claim that late hours were useful?",["The center was near a bus route.","The center offered water.","Attendance was highest from 4 p.m. to 7 p.m.","A heat advisory was in effect."],2,"The attendance pattern directly connects the late hours to actual use. The other details describe the setting but do not test that claim."],
  ["reading-tone-1","reading-tone","Tone","The proposal is ambitious, and its supporters have identified a real problem. Still, the budget estimate assumes volunteer labor will remain available for three years, an assumption the proposal does not defend. Before approval, the committee should request a revised budget that shows what happens if volunteer hours decline.","The author’s tone is best described as",["mocking and dismissive","uncritically enthusiastic","cautiously supportive but skeptical","confused and indifferent"],2,"The author acknowledges a real problem and ambition while identifying a specific unsupported assumption and asking for revision."],
  ["reading-tone-2","reading-tone","Tone","The new policy is concise and easy to follow. Its examples are particularly helpful for new employees. One section, however, uses a term that is never defined, so readers may apply it inconsistently. A brief definition would make an otherwise strong policy more reliable.","The tone is best described as",["hostile and sarcastic","balanced and constructive","entirely negative","excited but careless"],1,"The author identifies strengths, names one specific problem, and proposes a focused improvement."],
  ["reading-main-idea-3","reading-main-idea","Main idea","A transit agency received complaints that riders could not easily tell when buses were delayed. Rather than add more signs at every stop, the agency first compared complaints with route data. It found that confusion was concentrated at transfer points where two routes shared a stop. The agency then tested a single combined display at those locations before considering a wider rollout.","What is the main idea of the passage?",["The agency plans to put more signs at every stop.","The agency used evidence to target a transit-information problem before expanding a solution.","Bus delays are most common at transfer points.","Riders prefer combined displays to phone alerts."],1,"The passage is about locating where the problem occurs and testing a targeted solution; the other answers isolate or invent details."],
  ["reading-main-idea-4","reading-main-idea","Main idea","A grocery store began offering a quiet shopping hour each Tuesday. Managers initially measured success only by how many people attended. After speaking with shoppers, they learned that several people valued the hour even when attendance was low because the quieter environment made errands possible at all. The store now tracks both attendance and customer feedback.","Which statement best expresses the main idea?",["Tuesday is the least busy day at the grocery store.","Low attendance proves the quiet hour is unnecessary.","The store learned that one measurement did not fully capture the quiet hour’s value.","Customer feedback is always more accurate than attendance data."],2,"The passage contrasts a narrow measure with a fuller picture of whether the program helps. It does not reject attendance data entirely."],
  ["reading-purpose-3","reading-purpose","Author’s purpose","This notice asks visitors to silence their phones before entering the recovery area. It explains that patients are resting, staff are communicating clinical information, and loud alerts can interrupt both. Visitors who need to make a call are directed to the hallway seating area.","The author’s purpose is to",["criticize visitors for owning phones.","explain a rule and the reasons for it.","argue that phones should be prohibited throughout the building.","report the results of a visitor survey."],1,"The notice gives an instruction, explains why it exists, and offers an alternative location for calls."],
  ["reading-purpose-4","reading-purpose","Author’s purpose","A short guide explains how to prepare for a fire drill: listen for the alarm, leave by the nearest safe exit, and meet at the designated location. It also tells employees not to return for bags or equipment. The guide is distributed before the drill rather than after it.","Why was this guide written?",["To teach employees what to do during an upcoming drill.","To determine who caused a previous fire alarm.","To persuade employees to buy new safety equipment.","To describe the history of fire codes."],0,"The guide is procedural and prospective: it prepares people to carry out a drill safely."],
  ["reading-inference-3","reading-inference","Inference","A rehabilitation center added short captioned videos to its home-exercise instructions. At first, staff expected the videos mainly to help patients with hearing loss. In follow-up calls, many other patients said they replayed the demonstrations when they forgot the sequence of movements.","Which inference is best supported?",["Captioned videos can support more than the initially expected group of users.","Patients no longer need written exercise instructions.","Every patient prefers video to in-person teaching.","Hearing loss is the main reason patients forget exercises."],0,"The follow-up calls show an additional use: replaying demonstrations. The passage does not support universal claims or replacing written instructions."],
  ["reading-inference-4","reading-inference","Inference","A town’s recycling guide was rewritten with fewer categories and photographs of common items. In the month after the change, contamination in recycling bins fell. The town will keep collecting data through the winter, when holiday packaging changes what residents throw away.","What can reasonably be inferred?",["The guide may have helped residents sort items more accurately.","Photographs are never needed in public instructions.","Contamination will remain low in every season.","Residents had intentionally contaminated bins before the rewrite."],0,"The timing supports a cautious link between the clearer guide and lower contamination. The town’s continued data collection shows it is not claiming certainty across seasons."],
  ["reading-detail-3","reading-detail","Supporting detail","A clinic wanted to reduce the time patients spent checking in. It moved the insurance-verification step from the front desk to an online form completed before the visit. After the change, the median check-in time dropped from eleven minutes to five minutes, although some patients still needed help using the form.","Which detail most directly supports the claim that the change reduced check-in time?",["The clinic used an online form.","Some patients needed help with the form.","The median check-in time fell from eleven minutes to five minutes.","Insurance information was previously verified at the front desk."],2,"The before-and-after time measurement is direct outcome evidence; the other details describe the intervention or a limitation."],
  ["reading-detail-4","reading-detail","Supporting detail","A community center offered free blood-pressure screenings at a Saturday market. Volunteers set up near the entrance, used a large sign, and gave each participant a card explaining the result. By noon, 86 people had been screened, and 19 were referred to follow up with a clinician.","Which detail best supports the claim that the screening reached a substantial number of people?",["Volunteers set up near the entrance.","The sign was large.","Each participant received a result card.","Eighty-six people had been screened by noon."],3,"The number screened is the direct evidence about reach. The other details may have contributed, but they do not establish how many people were reached."],
  ["reading-tone-3","reading-tone","Tone","The report’s recommendation is sensible: replace the broken exterior lights before winter. Its cost estimate, however, is oddly incomplete because it omits installation. That omission is not a reason to abandon the project; it is a reason to request a real estimate before approving it.","The tone is best described as",["supportive but exacting","celebratory and uncritical","angry and accusatory","uncertain about whether lights are useful"],0,"The author agrees with the goal but insists the proposal meet a basic standard of completeness."],
  ["reading-tone-4","reading-tone","Tone","The volunteer manual is not glamorous, but it is unusually clear. It gives examples at the precise points where new volunteers are likely to make mistakes, and its checklist is short enough to use under pressure. Other manuals should steal this structure immediately.","The author’s tone is",["warmly approving","resentful","detached and neutral","worried about safety failures"],0,"The author strongly praises the manual’s practical clarity; “should steal this structure” is emphatic approval, not literal accusation."]
].map((x) => ({id:x[0],group:x[1],topic:x[2],passage:x[3],prompt:x[4],choices:x[5],answer:x[6],explanation:x[7],kind:"reading"}));

// The home session and every focused topic page read this same bank.
window.HESI_BANK = { vocabItems, mathItems, readingItems };

const meta = {
  vocab:["VOCABULARY · RETRIEVAL","Vocabulary retrieval queue","Say the meaning first. Unknown words are items we found, not evidence that you are bad at this.",vocabItems],
  "math-fractions":["MATH · FRACTIONS","Fractions","Convert, combine, and use fractions in actual quantities. Read the explanation after every answer.",mathItems.filter((x) => x.group === "math-fractions")],
  "math-decimals":["MATH · DECIMALS","Decimals","Place value and operations—not vibes. Work the item, then inspect the procedure.",mathItems.filter((x) => x.group === "math-decimals")],
  "math-percent":["MATH · PERCENT","Percent","Percent of, percent change, and finding the whole. These are different moves; the explanations name which.",mathItems.filter((x) => x.group === "math-percent")],
  "math-ratios":["MATH · RATIOS","Ratios and proportions","Treat ratios as relationships, then scale them without losing the relationship.",mathItems.filter((x) => x.group === "math-ratios")],
  "math-conversions":["MATH · CONVERSIONS","Conversions","Units, military time, and Roman numerals. Translate the representation before calculating.",mathItems.filter((x) => x.group === "math-conversions")],
  "math-rates":["MATH · RATES","Rates","Find the one-unit relationship first. The rest becomes much less mysterious.",mathItems.filter((x) => x.group === "math-rates")],
  "math-equations":["MATH · EQUATIONS","Equations and operations","Undo operations in a defensible order. One step at a time is still fast enough.",mathItems.filter((x) => x.group === "math-equations")],
  "reading-main-idea":["READING · MAIN IDEA","Main idea","A main idea has to cover the whole passage. A vivid detail or person is often bait.",readingItems.filter((x) => x.group === "reading-main-idea")],
  "reading-purpose":["READING · PURPOSE","Author’s purpose","Ask what the author is trying to do with the passage, not merely what facts appear in it.",readingItems.filter((x) => x.group === "reading-purpose")],
  "reading-inference":["READING · INFERENCE","Inference","Choose the claim the evidence supports—not the most dramatic thing that might be true.",readingItems.filter((x) => x.group === "reading-inference")],
  "reading-detail":["READING · DETAIL","Supporting detail","Find the detail that actually bears the claim’s weight, rather than a nearby fact.",readingItems.filter((x) => x.group === "reading-detail")],
  "reading-tone":["READING · TONE","Tone","Tone is the writer’s stance toward the topic: identify it from the whole pattern, not one adjective.",readingItems.filter((x) => x.group === "reading-tone")]
};

let state = readState(), topic = meta[topicKey] || meta.vocab, items = order(topic[3]), index = 0, answered = false;
function readState(){try{return {ratings:{},itemHistory:{},...JSON.parse(localStorage.getItem(TOPIC_STORAGE))}}catch{return {ratings:{},itemHistory:{}}}}
function save(){localStorage.setItem(TOPIC_STORAGE,JSON.stringify(state))}
function history(item){return state.itemHistory[item.id] || {attempts:0,correct:0,wrong:0}}
function order(items){return [...items].sort((a,b) => {const ah=history(a),bh=history(b);return (bh.wrong*4-bh.correct)-(ah.wrong*4-ah.correct)||a.id.localeCompare(b.id)})}
function setHead(){q("#topic-lane").textContent=topic[0];q("#topic-title").textContent=topic[1];q("#topic-description").textContent=topic[2];document.title=topic[1]+" · HESI Smoo"}
function choices(item){const box=q("#topic-choices");box.innerHTML="";item.choices.forEach((choice,n)=>{const b=document.createElement("button");b.type="button";b.textContent=choice;b.addEventListener("click",()=>answer(item,n,b));box.append(b)})}
function render(){const item=items[index];answered=false;setHead();q("#question-count").textContent=(item.kind==="vocab"?"Word ":"Question ")+(index+1);q("#question-progress").textContent=(index+1)+" / "+items.length;q("#topic-status").textContent=items.length+" focused "+(items.length===1?"item":"items");q("#topic-feedback").hidden=true;q("#topic-next").hidden=true;q("#vocab-answer-area").hidden=true;q("#vocab-ratings").hidden=true;q("#reveal-vocab").hidden=true;q("#topic-choices").hidden=false;q("#topic-passage").hidden=!item.passage;q("#topic-passage").textContent=item.passage||"";if(item.kind==="vocab"){q("#question-kind").textContent="WHAT DOES THIS MEAN?";q("#question-prompt").textContent=item.word;q("#topic-passage").hidden=false;q("#topic-passage").textContent="“"+item.example+"”";q("#topic-choices").hidden=true;q("#reveal-vocab").hidden=false}else{q("#question-kind").textContent=item.topic.toUpperCase()+" · ORIGINAL PRACTICE";q("#question-prompt").textContent=item.prompt;choices(item)}}
function answer(item,n,button){if(answered)return;answered=true;const correct=item.kind==="reading"?n===item.answer:item.choices[n]===item.answer,h=history(item);h.attempts++;h[correct?"correct":"wrong"]++;h.topic=item.topic;state.itemHistory[item.id]=h;save();[...q("#topic-choices").querySelectorAll("button")].forEach((x,i)=>{x.disabled=true;if(item.kind==="reading"?i===item.answer:x.textContent===item.answer)x.classList.add("selected-correct")});if(!correct)button.classList.add("selected-wrong");if(correct)feedFish();q("#topic-feedback").hidden=false;q("#topic-feedback").textContent=(correct?"Correct. ":"Useful—we found the move to reinforce. ")+item.explanation;q("#topic-next").hidden=false}
function reveal(){const item=items[index];q("#reveal-vocab").hidden=true;q("#vocab-answer").textContent=item.answer;q("#vocab-answer-area").hidden=false;q("#vocab-ratings").hidden=false}
function rate(rating){if(answered)return;answered=true;const item=items[index],r=state.ratings[item.id]||{again:0,hard:0,gotIt:0};r[rating]++;state.ratings[item.id]=r;save();if(rating==="gotIt")feedFish();q("#vocab-ratings").hidden=true;q("#topic-feedback").hidden=false;q("#topic-feedback").textContent=rating==="gotIt"?"Clean retrieval. It can get out of the way for a while.":"Nice—we found something worth returning to. That is the point of this round.";q("#topic-next").hidden=false}
function next(){if(index+1<items.length){index++;render();return}q("#topic-card").innerHTML='<p class="card-instruction">FOCUSED PASS COMPLETE</p><h2>Useful work: complete.</h2><p class="topic-completion-copy">The evidence is saved. Misses will come back sooner; this page does not need to turn into a punishment loop.</p>';q("#vocab-ratings").hidden=true;q("#topic-next").hidden=false;q("#topic-next span:first-child").textContent="RUN ANOTHER PASS";q("#topic-next").onclick=()=>{items=order(topic[3]);index=0;location.reload()}}
function feedFish(){const fish=q("#fishy"),food=q("#fish-food");if(!fish||!food)return;document.body.classList.remove("fish-fed");void document.body.offsetWidth;document.body.classList.add("fish-fed");clearTimeout(window.fishFoodTimer);window.fishFoodTimer=setTimeout(()=>document.body.classList.remove("fish-fed"),1100)}
function init(){q("#reveal-vocab").addEventListener("click",reveal);document.querySelectorAll("[data-rating]").forEach((b)=>b.addEventListener("click",()=>rate(b.dataset.rating)));q("#topic-next").addEventListener("click",next);render();if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js",{updateViaCache:"none"}).catch(()=>{}))}
if(document.body.classList.contains("topic-page"))init();
})();

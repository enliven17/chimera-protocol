"""
MeTTa Reasoning Engine for ChimeraProtocol
Based on SingularityNET MeTTa examples and symbolic reasoning
"""

import re
import json
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass
from enum import Enum

class MeTTaType(Enum):
    """MeTTa data types"""
    ATOM = "atom"
    NUMBER = "number"
    STRING = "string"
    EXPRESSION = "expression"
    VARIABLE = "variable"

@dataclass
class MeTTaAtom:
    """MeTTa atomic value"""
    value: Any
    type: MeTTaType
    
    def __str__(self):
        return str(self.value)
    
    def __repr__(self):
        return f"MeTTaAtom({self.value}, {self.type})"

@dataclass
class MeTTaExpression:
    """MeTTa expression (list of atoms)"""
    atoms: List[Union[MeTTaAtom, 'MeTTaExpression']]
    
    def __str__(self):
        return f"({' '.join(str(atom) for atom in self.atoms)})"
    
    def __repr__(self):
        return f"MeTTaExpression({self.atoms})"

class MeTTaParser:
    """Parser for MeTTa expressions"""
    
    def __init__(self):
        self.variables = {}
    
    def parse(self, text: str) -> Union[MeTTaAtom, MeTTaExpression]:
        """Parse MeTTa text into atoms/expressions"""
        
        text = text.strip()
        
        if text.startswith('(') and text.endswith(')'):
            # Parse expression
            return self._parse_expression(text[1:-1])
        else:
            # Parse atom
            return self._parse_atom(text)
    
    def _parse_expression(self, text: str) -> MeTTaExpression:
        """Parse expression content"""
        
        atoms = []
        current = ""
        paren_count = 0
        in_string = False
        
        for char in text:
            if char == '"' and not in_string:
                in_string = True
                current += char
            elif char == '"' and in_string:
                in_string = False
                current += char
            elif char == '(' and not in_string:
                paren_count += 1
                current += char
            elif char == ')' and not in_string:
                paren_count -= 1
                current += char
            elif char == ' ' and paren_count == 0 and not in_string:
                if current.strip():
                    atoms.append(self.parse(current.strip()))
                current = ""
            else:
                current += char
        
        if current.strip():
            atoms.append(self.parse(current.strip()))
        
        return MeTTaExpression(atoms)
    
    def _parse_atom(self, text: str) -> MeTTaAtom:
        """Parse atomic value"""
        
        # Variable (starts with $)
        if text.startswith('$'):
            return MeTTaAtom(text, MeTTaType.VARIABLE)
        
        # String (quoted)
        if text.startswith('"') and text.endswith('"'):
            return MeTTaAtom(text[1:-1], MeTTaType.STRING)
        
        # Number
        try:
            if '.' in text:
                return MeTTaAtom(float(text), MeTTaType.NUMBER)
            else:
                return MeTTaAtom(int(text), MeTTaType.NUMBER)
        except ValueError:
            pass
        
        # Atom
        return MeTTaAtom(text, MeTTaType.ATOM)

class MeTTaKnowledgeBase:
    """MeTTa knowledge base with rules and facts"""
    
    def __init__(self):
        self.rules = []
        self.facts = []
        self.parser = MeTTaParser()
    
    def add_rule(self, rule_text: str):
        """Add a rule to the knowledge base"""
        
        try:
            rule = self.parser.parse(rule_text)
            self.rules.append(rule)
        except Exception as e:
            print(f"Error parsing rule: {rule_text} - {e}")
    
    def add_fact(self, fact_text: str):
        """Add a fact to the knowledge base"""
        
        try:
            fact = self.parser.parse(fact_text)
            self.facts.append(fact)
        except Exception as e:
            print(f"Error parsing fact: {fact_text} - {e}")
    
    def load_from_file(self, filename: str):
        """Load rules and facts from MeTTa file"""
        
        try:
            with open(filename, 'r') as f:
                content = f.read()
            
            # Parse MeTTa file
            lines = content.split('\n')
            current_rule = ""
            
            for line in lines:
                line = line.strip()
                
                # Skip comments and empty lines
                if not line or line.startswith(';'):
                    continue
                
                # Multi-line rules
                if line.startswith('(=') or current_rule:
                    current_rule += " " + line
                    
                    # Check if rule is complete
                    if current_rule.count('(') == current_rule.count(')'):
                        self.add_rule(current_rule.strip())
                        current_rule = ""
                else:
                    # Single line fact
                    self.add_fact(line)
                    
        except FileNotFoundError:
            print(f"MeTTa file not found: {filename}")
        except Exception as e:
            print(f"Error loading MeTTa file: {e}")

class MeTTaReasoner:
    """MeTTa reasoning engine"""
    
    def __init__(self):
        self.kb = MeTTaKnowledgeBase()
        self.parser = MeTTaParser()
        self.bindings = {}
        
        # Load market analysis rules
        self._load_market_rules()
    
    def _load_market_rules(self):
        """Load built-in market analysis rules"""
        
        # Contrarian strategy rules
        self.kb.add_rule("""
        (= (contrarian-signal $ratio)
           (if (> $ratio 0.75) high-contrarian
               (if (> $ratio 0.65) medium-contrarian
                   low-contrarian)))
        """)
        
        self.kb.add_rule("""
        (= (risk-level $volume $ratio)
           (if (< $volume 1000) high-risk
               (if (and (> $volume 5000) (< $ratio 0.6) (> $ratio 0.4)) low-risk
                   medium-risk)))
        """)
        
        self.kb.add_rule("""
        (= (confidence $ratio $volume)
           (let $contrarian (contrarian-signal $ratio)
                $risk (risk-level $volume $ratio)
                (if (and (== $contrarian high-contrarian) (== $risk low-risk)) 0.9
                    (if (== $contrarian medium-contrarian) 0.7
                        0.5))))
        """)
        
        # Betting recommendation rules
        self.kb.add_rule("""
        (= (betting-recommendation $ratio $volume)
           (let $contrarian (contrarian-signal $ratio)
                (if (== $contrarian high-contrarian)
                    (if (> $ratio 0.5) BUY_B BUY_A)
                    HOLD)))
        """)
        
        # Load from external file if available
        try:
            self.kb.load_from_file("metta_knowledge_base.metta")
        except:
            pass
    
    def query(self, query_text: str) -> List[Any]:
        """Execute MeTTa query"""
        
        try:
            query = self.parser.parse(query_text)
            return self._evaluate(query)
        except Exception as e:
            print(f"Error executing query: {query_text} - {e}")
            return []
    
    def _evaluate(self, expr: Union[MeTTaAtom, MeTTaExpression]) -> List[Any]:
        """Evaluate MeTTa expression"""
        
        if isinstance(expr, MeTTaAtom):
            return [self._evaluate_atom(expr)]
        
        elif isinstance(expr, MeTTaExpression):
            return self._evaluate_expression(expr)
        
        return []
    
    def _evaluate_atom(self, atom: MeTTaAtom) -> Any:
        """Evaluate atomic value"""
        
        if atom.type == MeTTaType.VARIABLE:
            return self.bindings.get(atom.value, atom.value)
        else:
            return atom.value
    
    def _evaluate_expression(self, expr: MeTTaExpression) -> List[Any]:
        """Evaluate expression"""
        
        if not expr.atoms:
            return []
        
        # Get function name
        func_atom = expr.atoms[0]
        if not isinstance(func_atom, MeTTaAtom):
            return []
        
        func_name = func_atom.value
        args = expr.atoms[1:]
        
        # Built-in functions
        if func_name == '>':
            return self._builtin_gt(args)
        elif func_name == '<':
            return self._builtin_lt(args)
        elif func_name == '==':
            return self._builtin_eq(args)
        elif func_name == 'and':
            return self._builtin_and(args)
        elif func_name == 'or':
            return self._builtin_or(args)
        elif func_name == 'if':
            return self._builtin_if(args)
        elif func_name == 'let':
            return self._builtin_let(args)
        
        # User-defined functions
        return self._evaluate_user_function(func_name, args)
    
    def _builtin_gt(self, args: List) -> List[bool]:
        """Greater than comparison"""
        if len(args) >= 2:
            val1 = self._get_numeric_value(args[0])
            val2 = self._get_numeric_value(args[1])
            return [val1 > val2]
        return [False]
    
    def _builtin_lt(self, args: List) -> List[bool]:
        """Less than comparison"""
        if len(args) >= 2:
            val1 = self._get_numeric_value(args[0])
            val2 = self._get_numeric_value(args[1])
            return [val1 < val2]
        return [False]
    
    def _builtin_eq(self, args: List) -> List[bool]:
        """Equality comparison"""
        if len(args) >= 2:
            val1 = self._evaluate(args[0])[0] if self._evaluate(args[0]) else None
            val2 = self._evaluate(args[1])[0] if self._evaluate(args[1]) else None
            return [val1 == val2]
        return [False]
    
    def _builtin_and(self, args: List) -> List[bool]:
        """Logical AND"""
        results = []
        for arg in args:
            result = self._evaluate(arg)
            if not result or not result[0]:
                return [False]
            results.extend(result)
        return [True]
    
    def _builtin_or(self, args: List) -> List[bool]:
        """Logical OR"""
        for arg in args:
            result = self._evaluate(arg)
            if result and result[0]:
                return [True]
        return [False]
    
    def _builtin_if(self, args: List) -> List[Any]:
        """Conditional expression"""
        if len(args) >= 3:
            condition = self._evaluate(args[0])
            if condition and condition[0]:
                return self._evaluate(args[1])
            else:
                return self._evaluate(args[2])
        return []
    
    def _builtin_let(self, args: List) -> List[Any]:
        """Let binding"""
        if len(args) >= 3:
            # Simple let implementation
            var_name = args[0]
            var_value = self._evaluate(args[1])
            
            # Save old binding
            old_binding = self.bindings.get(var_name, None)
            
            # Set new binding
            if var_value:
                self.bindings[var_name] = var_value[0]
            
            # Evaluate body
            result = self._evaluate(args[2])
            
            # Restore old binding
            if old_binding is not None:
                self.bindings[var_name] = old_binding
            elif var_name in self.bindings:
                del self.bindings[var_name]
            
            return result
        return []
    
    def _evaluate_user_function(self, func_name: str, args: List) -> List[Any]:
        """Evaluate user-defined function"""
        
        # Simple pattern matching for market analysis functions
        if func_name == 'contrarian-signal':
            if args:
                ratio = self._get_numeric_value(args[0])
                if ratio > 0.75:
                    return ['high-contrarian']
                elif ratio > 0.65:
                    return ['medium-contrarian']
                else:
                    return ['low-contrarian']
        
        elif func_name == 'risk-level':
            if len(args) >= 2:
                volume = self._get_numeric_value(args[0])
                ratio = self._get_numeric_value(args[1])
                
                if volume < 1000:
                    return ['high-risk']
                elif volume > 5000 and 0.4 < ratio < 0.6:
                    return ['low-risk']
                else:
                    return ['medium-risk']
        
        elif func_name == 'betting-recommendation':
            if len(args) >= 2:
                ratio = self._get_numeric_value(args[0])
                volume = self._get_numeric_value(args[1])
                
                # Apply contrarian strategy
                if ratio > 0.75 and volume > 1000:
                    return ['BUY_B']
                elif ratio < 0.25 and volume > 1000:
                    return ['BUY_A']
                else:
                    return ['HOLD']
        
        return []
    
    def _get_numeric_value(self, expr) -> float:
        """Get numeric value from expression"""
        
        if isinstance(expr, MeTTaAtom):
            if expr.type == MeTTaType.NUMBER:
                return float(expr.value)
            elif expr.type == MeTTaType.VARIABLE:
                val = self.bindings.get(expr.value, 0)
                return float(val) if isinstance(val, (int, float)) else 0
        
        result = self._evaluate(expr)
        if result and isinstance(result[0], (int, float)):
            return float(result[0])
        
        return 0.0
    
    def analyze_market(self, market_data: Dict) -> Dict:
        """Analyze market using MeTTa reasoning"""
        
        try:
            option_a_ratio = float(market_data.get("optionARatio", 0.5))
            total_volume = float(market_data.get("totalVolume", 0))
            
            # Set variables for reasoning
            self.bindings['$ratio'] = option_a_ratio
            self.bindings['$volume'] = total_volume
            
            # Execute MeTTa queries
            contrarian_result = self.query(f"(contrarian-signal {option_a_ratio})")
            risk_result = self.query(f"(risk-level {total_volume} {option_a_ratio})")
            recommendation_result = self.query(f"(betting-recommendation {option_a_ratio} {total_volume})")
            
            # Calculate confidence
            confidence = 0.5
            if contrarian_result and contrarian_result[0] == 'high-contrarian':
                confidence = 0.8
            elif contrarian_result and contrarian_result[0] == 'medium-contrarian':
                confidence = 0.6
            
            # Adjust confidence based on risk
            if risk_result and risk_result[0] == 'low-risk':
                confidence = min(0.95, confidence * 1.2)
            elif risk_result and risk_result[0] == 'high-risk':
                confidence *= 0.7
            
            recommendation = recommendation_result[0] if recommendation_result else 'HOLD'
            risk_level = risk_result[0] if risk_result else 'medium-risk'
            contrarian_signal = contrarian_result[0] if contrarian_result else 'low-contrarian'
            
            reasoning = f"MeTTa analysis: {contrarian_signal} detected with {option_a_ratio:.1%} ratio, {risk_level}"
            
            return {
                "recommendation": recommendation,
                "confidence": confidence,
                "reasoning": reasoning,
                "risk_level": risk_level.replace('-', '_').upper(),
                "metta_analysis": f"Applied MeTTa reasoning with {len(self.kb.rules)} rules",
                "contrarian_signal": contrarian_signal,
                "variables_used": dict(self.bindings)
            }
            
        except Exception as e:
            print(f"MeTTa analysis error: {e}")
            return self._fallback_analysis(market_data)
    
    def _fallback_analysis(self, market_data: Dict) -> Dict:
        """Fallback analysis if MeTTa fails"""
        
        option_a_ratio = float(market_data.get("optionARatio", 0.5))
        total_volume = float(market_data.get("totalVolume", 0))
        
        # Simple contrarian logic
        if option_a_ratio > 0.75:
            recommendation = "BUY_B"
            confidence = min(0.8, (option_a_ratio - 0.5) * 2)
            reasoning = f"Fallback contrarian: Option A heavily favored at {option_a_ratio:.1%}"
        elif option_a_ratio < 0.25:
            recommendation = "BUY_A"
            confidence = min(0.8, (0.5 - option_a_ratio) * 2)
            reasoning = f"Fallback contrarian: Option B heavily favored at {1-option_a_ratio:.1%}"
        else:
            recommendation = "HOLD"
            confidence = 0.5
            reasoning = "Fallback: Market appears balanced"
        
        risk_level = "HIGH" if total_volume < 1000 else "LOW" if total_volume > 10000 else "MEDIUM"
        
        return {
            "recommendation": recommendation,
            "confidence": confidence,
            "reasoning": reasoning,
            "risk_level": risk_level,
            "metta_analysis": "Fallback heuristic analysis (MeTTa unavailable)"
        }

# Test the MeTTa engine
if __name__ == "__main__":
    print("🧠 Testing MeTTa Reasoning Engine...")
    
    reasoner = MeTTaReasoner()
    
    # Test market analysis
    test_markets = [
        {"optionARatio": 0.85, "totalVolume": 15000},
        {"optionARatio": 0.25, "totalVolume": 8000},
        {"optionARatio": 0.55, "totalVolume": 500}
    ]
    
    for i, market in enumerate(test_markets, 1):
        print(f"\n📊 Test Market {i}:")
        print(f"   Option A Ratio: {market['optionARatio']:.1%}")
        print(f"   Total Volume: {market['totalVolume']:,}")
        
        result = reasoner.analyze_market(market)
        
        print(f"   🎯 Recommendation: {result['recommendation']}")
        print(f"   📈 Confidence: {result['confidence']:.1%}")
        print(f"   💭 Reasoning: {result['reasoning']}")
        print(f"   ⚠️ Risk Level: {result['risk_level']}")
        print(f"   🧠 MeTTa: {result['metta_analysis']}")
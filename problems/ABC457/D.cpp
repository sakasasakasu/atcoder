#include <bits/stdc++.h>
using namespace std;

int main() {
    int N, K;
    cin >> N >> K;
    
    priority_queue<pair<long long,long long>,
                   vector<pair<long long,long long>>,
                   greater<pair<long long,long long>>> A;

    for (int i = 0; i < N; i++) {
        long long a;
        cin >> a;
        A.push({a, i + 1});
    }

    for (int i = 0; i < K; i++) {
        auto p = A.top();
        A.pop();
        A.push({p.first + p.second, p.second});
    }

    cout << A.top().first << endl;

}

// ty 843bc89e24446fb668f5
